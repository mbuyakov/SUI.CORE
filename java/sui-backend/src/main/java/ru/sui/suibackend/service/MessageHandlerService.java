package ru.sui.suibackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.TreeNode;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.LongNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ru.sui.suibackend.message.model.Grouping;
import ru.sui.suibackend.message.model.Sorting;
import ru.sui.suibackend.message.model.SortingDirection;
import ru.sui.suibackend.message.request.*;
import ru.sui.suibackend.message.response.ResponseMessageType;
import ru.sui.suibackend.model.ResponseMessage;
import ru.sui.suibackend.model.UserState;
import ru.sui.suientity.entity.suimeta.ColumnInfo;
import ru.sui.suisecurity.base.security.UserPrincipal;
import ru.sui.suisecurity.base.utils.MetaSchemaUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MessageHandlerService {

  private static final String MESSAGE_TYPE_KEY = "type";
  private static final String MESSAGE_CURRENT_PAGE_KEY = "currentPage";
  private static final String MESSAGE_CONTENT_KEY = "content";
  private static final String SELECTION_KEY = "selection";

  @Autowired
  private ObjectMapper objectMapper;
  @Autowired
  private BackendService backendService;
  @Autowired
  private MetaAccessService metaAccessService;

  public @NonNull
  ResponseMessage processMessage(@NonNull String messagePayload, @NonNull UserState userState) {
    val user = ((UserPrincipal) (SecurityContextHolder.getContext().getAuthentication()).getPrincipal()).getUser();
    log.info("Message from {}: {}", user.getUsername(), messagePayload);

    try {
      val parsedPayload = objectMapper.readTree(messagePayload);

      switch (MessageType.valueOf(parsedPayload.get(MESSAGE_TYPE_KEY).asText())) {
        case INIT:
          val initMessage = parsedTreeToMessage(parsedPayload, InitMessage.class);
          val metaData = metaAccessService.getMetaData(initMessage.getTableInfoId(), user);
          val tableInfo = metaData.getTable().getTableInfo();

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

          val pageNumber = Optional.ofNullable(initMessage.getCurrentPage()).orElse(0L);

          userState.clear();
          userState.setMetaData(metaData);
          userState.setOffset(pageNumber * initMessage.getPageSize());
          userState.setPageSize(initMessage.getPageSize());
          userState.setFilters(initMessage.getDefaultFilters());
          userState.setGlobalFilters(initMessage.getGlobalFilters());
          userState.setSorts(orderSortedColumnInfos
            .stream()
            .filter(columnInfo -> columnInfo.getDefaultSorting() != null)
            .map(columnInfo -> Sorting.builder()
              .columnName(columnInfo.getColumnName())
              .direction(SortingDirection.valueOf(columnInfo.getDefaultSorting().toUpperCase()))
              .build())
            .collect(Collectors.toList()));
          userState.setGroupings(orderSortedColumnInfos
            .stream()
            .filter(columnInfo -> Boolean.TRUE.equals(columnInfo.getDefaultGrouping()))
            .map(columnInfo -> Grouping.builder().columnName(columnInfo.getColumnName()).build())
            .collect(Collectors.toList()));
          break;
        case PAGE_CHANGE:
          val pageChangeMessage = parsedTreeToMessage(parsedPayload, PageChangeMessage.class);
          userState.setOffset(userState.getPageSize() * (pageChangeMessage.getCurrentPage()));
          break;
        case PAGE_SIZE_CHANGE:
          val pageSizeChangeMessage = parsedTreeToMessage(parsedPayload, PageSizeChangeMessage.class);
          val newPageSize = pageSizeChangeMessage.getPageSize();
          userState.setOffset(userState.getOffset() / newPageSize * newPageSize);
          userState.setPageSize(newPageSize);
          break;
        case FILTER_CHANGE:
          val filterChangeMessage = parsedTreeToMessage(parsedPayload, FilterChangeMessage.class);
          userState.setFilters(filterChangeMessage.getFilters());
          break;
        case SORT_CHANGE:
          val sortChangeMessage = parsedTreeToMessage(parsedPayload, SortChangeMessage.class);
          userState.setSorts(sortChangeMessage.getSorts());
          break;
        case GROUPING_CHANGE:
          val groupingChangeMessage = parsedTreeToMessage(parsedPayload, GroupingChangeMessage.class);

          val oldGroupings = userState.getGroupings();
          val newGroupings = Optional
            .ofNullable(groupingChangeMessage.getGroupings())
            .orElse(Collections.emptyList());
          val expandedGroups = userState.getExpandedGroups();

          userState.setGroupings(newGroupings);

          // check it's need to update grouping columns
          // (in this case after message will receive EXPANDED_GROUP_CHANGE message with new expanded groups)
          // (this let to stop generate query with wrong expanded groups)
          if ((oldGroupings != null && !oldGroupings.isEmpty()) && (expandedGroups != null && !expandedGroups.isEmpty())) {
            val shouldQueryNewData = new AtomicBoolean(true);
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

            if (!shouldQueryNewData.get()) {
              return ResponseMessage
                .builder()
                .data(objectMapper.createObjectNode())
                .type(ResponseMessageType.WITHOUT_UPDATE)
                .build();
            }
          }

          break;
        case EXPANDED_GROUP_CHANGE:
          val expandedGroupChangeMessage = parsedTreeToMessage(parsedPayload, ExpandedGroupChangeMessage.class);
          userState.setExpandedGroups(expandedGroupChangeMessage.getExpandedGroups());
          break;
        default:
          throw new IllegalArgumentException(
            "Unsupported message type: " + parsedPayload.get("type").asText());
      }

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

      return ResponseMessage
        .builder()
        .data(treePageData)
        .type(ResponseMessageType.DATA)
        .build();
    } catch (Exception exception) {
      log.error("Exception in handleTextMessage: ", exception);

      val exceptionStackTraceSW = new StringWriter();
      exception.printStackTrace(new PrintWriter(exceptionStackTraceSW));

      return ResponseMessage
        .builder()
        .data(objectMapper.createObjectNode()
          .put("message", exception.getMessage())
          .put("error", exceptionStackTraceSW.toString()))
        .type(ResponseMessageType.ERROR)
        .build();
    }
  }

  private <T> T parsedTreeToMessage(TreeNode node, Class<T> tClass) throws JsonProcessingException {
    return objectMapper.treeToValue(node.get(MESSAGE_CONTENT_KEY), tClass);
  }

  private Collection<String> getSelection(JsonNode parsedPayload) throws IOException {
    return objectMapper.readValue(
      objectMapper.treeAsTokens(parsedPayload.get(SELECTION_KEY)),
      new TypeReference<List<String>>() {
      });
  }

}
