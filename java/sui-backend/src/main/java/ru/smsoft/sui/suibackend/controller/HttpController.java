package ru.smsoft.sui.suibackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import lombok.var;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.smsoft.sui.suibackend.model.UserState;
import ru.smsoft.sui.suibackend.service.MessageHandlerService;

import java.util.concurrent.TimeUnit;

import static ru.smsoft.sui.suibackend.utils.Constants.*;

@RestController
@Slf4j
public class HttpController {

    private final Cache<String, UserState> userStateCache = CacheBuilder
            .newBuilder()
            .expireAfterWrite(3, TimeUnit.HOURS)
            .build();

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MessageHandlerService messageHandlerService;

    @PostMapping(BACKEND_ENDPOINT + "-http")
    public ObjectNode processMessage(
            @RequestHeader(INIT_SESSION_ID_KEY) String sessionId,
            @RequestBody String payload) {
        if (!"DISCONNECT".equals(payload)) {
            var userState = userStateCache.getIfPresent(sessionId);

            if (userState == null) {
                userState = new UserState();
                userStateCache.put(sessionId, userState);
            }

            val responseMessage = messageHandlerService.processMessage(payload, userState);
            val content = responseMessage.getData();

            content.set(TYPE_KEY, new TextNode(responseMessage.getType().toString()));

            return content;
        } else {
            userStateCache.invalidate(sessionId);

            return objectMapper.createObjectNode();
        }
    }

}
