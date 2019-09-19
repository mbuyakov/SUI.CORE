package ru.smsoft.sui.suibackend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import ru.smsoft.sui.suibackend.message.model.Grouping;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.message.model.SortingDirection;
import ru.smsoft.sui.suibackend.message.response.ResponseMessageType;
import ru.smsoft.sui.suibackend.model.UserState;
import ru.smsoft.sui.suibackend.service.BackendService;
import ru.smsoft.sui.suibackend.service.MetaAccessService;
import ru.smsoft.sui.suibackend.message.request.*;
import ru.smsoft.sui.suibackend.utils.Constants;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;
import ru.smsoft.sui.suisecurity.security.UserPrincipal;
import ru.smsoft.sui.suisecurity.utils.MetaSchemaUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.security.Principal;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiConsumer;
import java.util.stream.Collectors;

@Controller
@Slf4j
@RequiredArgsConstructor
public class SocketController {

    private static final String MESSAGE_TYPE_KEY = "type";
    private static final String MESSAGE_CURRENT_PAGE_KEY = "currentPage";
    private static final String MESSAGE_CONTENT_KEY = "content";
    private static final String USER_STATE_KEY = "state";
    private static final String SELECTION_KEY = "selection";
    private static final String MESSAGE_ID = "__messageId";

    @NonNull
    private SimpMessageSendingOperations messagingTemplate;
    @NonNull
    private ObjectMapper objectMapper;
    @NonNull
    private BackendService backendService;
    @NonNull
    private MetaAccessService metaAccessService;

    @MessageMapping("/data")
    public void processMessage(
            SimpMessageHeaderAccessor headerAccessor, Message<byte[]> message, Principal principal) {
        log.info("Message from {}: {}", principal.getName(), new String(message.getPayload()));

        val user = ((UserPrincipal) ((UsernamePasswordAuthenticationToken) principal).getPrincipal()).getUser();

        try {
            val parsedPayload = objectMapper.readTree(message.getPayload());

            switch (MessageType.valueOf(parsedPayload.get(MESSAGE_TYPE_KEY).asText())) {
                case INIT:
                    val initMessage = parsedTreeToMessage(parsedPayload, InitMessage.class);
                    val metaData = metaAccessService.getMetaData(initMessage.getTableInfoId(), user.getRoles());
                    val tableInfo = metaData.getTableInfo();

                    if (tableInfo == null) {
                        throw new IllegalArgumentException("TableInfo with id " + initMessage.getTableInfoId() + " not found");
                    }

                    @SuppressWarnings("ConstantConditions")
                    val orderSortedColumnInfos = new TreeSet<ColumnInfo>(Comparator
                            .comparing(
                                    ColumnInfo::getOrder,
                                    Comparator.nullsLast(Comparator.naturalOrder()))
                            .thenComparingLong(ColumnInfo::getId));
                    orderSortedColumnInfos.addAll(MetaSchemaUtils.getAllowedColumnInfos(tableInfo, user.getRoles()));

                    val sorts = orderSortedColumnInfos
                            .stream()
                            .filter(columnInfo -> columnInfo.getDefaultSorting() != null)
                            .map(columnInfo -> Sorting.builder()
                                    .columnName(columnInfo.getColumnName())
                                    .direction(SortingDirection.valueOf(columnInfo.getDefaultSorting().toUpperCase()))
                                    .build())
                            .collect(Collectors.toList());

                    if (headerAccessor.getSessionAttributes() == null) {
                        headerAccessor.setSessionAttributes(new HashMap<>());
                    }

                    headerAccessor.getSessionAttributes().put(
                            USER_STATE_KEY,
                            UserState.builder()
                                    .tableInfo(tableInfo)
                                    .columns(metaData.getColumns())
                                    .offset(0L)
                                    .pageSize(initMessage.getPageSize())
                                    .filters(initMessage.getDefaultFilters())
                                    .globalFilters(initMessage.getGlobalFilters())
                                    .sorts(sorts)
                                    .groupings(orderSortedColumnInfos
                                            .stream()
                                            .filter(columnInfo -> Boolean.TRUE.equals(columnInfo.getDefaultGrouping()))
                                            .map(columnInfo -> Grouping.builder().columnName(columnInfo.getColumnName()).build())
                                            .collect(Collectors.toList()))
                                    .build());
                    break;
                case PAGE_CHANGE:
                    processUpdateUserStateMessage(
                            headerAccessor,
                            parsedPayload,
                            PageChangeMessage.class,
                            (userState, pageChangeMessage) ->
                                    userState.setOffset(userState.getPageSize() * (pageChangeMessage.getCurrentPage())));
                    break;
                case PAGE_SIZE_CHANGE:
                    processUpdateUserStateMessage(
                            headerAccessor,
                            parsedPayload,
                            PageSizeChangeMessage.class,
                            (userState, pageSizeChangeMessage) -> {
                                val newPageSize = pageSizeChangeMessage.getPageSize();
                                userState.setOffset(userState.getOffset() / newPageSize * newPageSize);
                                userState.setPageSize(newPageSize);
                            });
                    break;
                case FILTER_CHANGE:
                    processUpdateUserStateMessage(
                            headerAccessor,
                            parsedPayload,
                            FilterChangeMessage.class,
                            (userState, filterChangeMessage) ->
                                    userState.setFilters(filterChangeMessage.getFilters()));
                    break;
                case SORT_CHANGE:
                    processUpdateUserStateMessage(
                            headerAccessor,
                            parsedPayload,
                            SortChangeMessage.class,
                            (userState, sortChangeMessage) ->
                                    userState.setSorts(sortChangeMessage.getSorts()));
                    break;
                case GROUPING_CHANGE:
                    AtomicBoolean shouldQueryNewData = new AtomicBoolean(true);

                    processUpdateUserStateMessage(
                            headerAccessor,
                            parsedPayload,
                            GroupingChangeMessage.class,
                            (userState, groupingChangeMessage) -> {
                                val oldGroupings = userState.getGroupings();
                                val newGroupings = Optional
                                        .ofNullable(groupingChangeMessage.getGroupings())
                                        .orElse(Collections.emptyList());
                                val expandedGroups = userState.getExpandedGroups();

                                userState.setGroupings(newGroupings);

                                // check it's need to update grouping columns
                                // (in this case after message will receive EXPANDED_GROUP_CHANGE message with new expanded groups)
                                // (this let to stop generate query with wrong expanded groups)
                                if ((oldGroupings != null && !oldGroupings.isEmpty())
                                        && (expandedGroups != null && !expandedGroups.isEmpty())) {
                                    val oldGroupingIndex = new AtomicInteger(0);

                                    if (oldGroupings
                                            .stream()
                                            .anyMatch(grouping -> newGroupings.indexOf(grouping) != oldGroupingIndex.getAndIncrement())) {
                                        val maxExpandedGroupSize = expandedGroups
                                                .stream()
                                                .mapToInt(expandedGroup -> expandedGroup.getGroup().size())
                                                .max()
                                                .orElse(0);

                                        shouldQueryNewData.set(oldGroupingIndex.get() > maxExpandedGroupSize);
                                    }
                                }
                            });

                    if (!shouldQueryNewData.get()) {
                        sendMessage(headerAccessor, principal, ResponseMessageType.WITHOUT_UPDATE, null);
                        return;
                    }

                    break;
                case EXPANDED_GROUP_CHANGE:
                    processUpdateUserStateMessage(
                            headerAccessor,
                            parsedPayload,
                            ExpandedGroupChangeMessage.class,
                            (userState, expandedGroupChangeMessage) ->
                                    userState.setExpandedGroups(expandedGroupChangeMessage.getExpandedGroups()));
                    break;
                default:
                    throw new IllegalArgumentException(
                            "Unsupported message type: " + parsedPayload.get("type").asText());
            }

            val userState = getUserState(headerAccessor);

            if (userState != null) {
                if (parsedPayload.has(SELECTION_KEY)) {
                    userState.setSelection(getSelection(parsedPayload));
                }

                val pageData = backendService.getData(userState);
                val treePageData = objectMapper.<ObjectNode>valueToTree(pageData);

                val currentPage = Math.min(
                        Optional.ofNullable(userState.getOffset()).orElse(0L),
                        Math.max(pageData.getTotalCount() - 1, 0)) / userState.getPageSize();

                userState.setOffset(currentPage * userState.getPageSize());

                treePageData.set(MESSAGE_CURRENT_PAGE_KEY, new LongNode(currentPage));

                log.trace("User state: {}", userState);

                sendMessage(headerAccessor, principal, ResponseMessageType.DATA, treePageData);
            } else {
                throw new RuntimeException("User state not found");
            }
        } catch (Exception exception) {
            log.error("Exception in handleTextMessage: ", exception);

            StringWriter exceptionStackTraceSW = new StringWriter();
            exception.printStackTrace(new PrintWriter(exceptionStackTraceSW));

            sendMessage(
                    headerAccessor,
                    principal,
                    ResponseMessageType.ERROR,
                    (objectMapper.createObjectNode()
                            .put("message", exception.getMessage())
                            .put("error", exceptionStackTraceSW.toString())));
        }
    }

    private <T> void processUpdateUserStateMessage(
            SimpMessageHeaderAccessor accessor,
            TreeNode parsedMessage,
            Class<T> tClass,
            BiConsumer<UserState, T> userStateConsumer) throws JsonProcessingException {
        val userState = getUserState(accessor);

        if (userState != null) {
            userStateConsumer.accept(userState, parsedTreeToMessage(parsedMessage, tClass));
        } else {
            throw new IllegalArgumentException("User state is not inited");
        }
    }

    private <T> T parsedTreeToMessage(TreeNode node, Class<T> tClass) throws JsonProcessingException {
        return objectMapper.treeToValue(node.get(MESSAGE_CONTENT_KEY), tClass);
    }

    private UserState getUserState(SimpMessageHeaderAccessor accessor) {
        val sessionAttributes = accessor.getSessionAttributes();
        return sessionAttributes == null
                ? null
                : (UserState) sessionAttributes.get(USER_STATE_KEY);
    }

    private void sendMessage(
            SimpMessageHeaderAccessor headerAccessor,
            Principal principal,
            @org.springframework.lang.NonNull ResponseMessageType type,
            ObjectNode content) {
        if (content == null) {
            content = objectMapper.createObjectNode();
        }

        content.set("type", new TextNode(type.toString()));

        val messageId = Optional
                .ofNullable(headerAccessor.getNativeHeader(MESSAGE_ID))
                .map(list -> list.isEmpty() ? null : list.get(0))
                .orElse(null);

        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                Constants.SEND_TO_DESTINATION + "/" + headerAccessor.getSessionId(),
                content.set(MESSAGE_ID, new TextNode(messageId)));
    }

    private Collection<String> getSelection(JsonNode parsedPayload) throws IOException {
        return objectMapper.readValue(
                objectMapper.treeAsTokens(parsedPayload.get(SELECTION_KEY)),
                new TypeReference<List<String>>() {
                });
    }

}
