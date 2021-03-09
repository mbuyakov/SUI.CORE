package ru.sui.suibackend.controller;

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
import ru.sui.suibackend.cache.UserStateCache;
import ru.sui.suibackend.model.UserState;
import ru.sui.suibackend.service.MessageHandlerService;

import java.util.concurrent.TimeUnit;

import static ru.sui.suibackend.utils.Constants.*;


@RestController
@Slf4j
@CrossOrigin
public class HttpController {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MessageHandlerService messageHandlerService;
    @Autowired
    private UserStateCache userStateCache;

    @PostMapping(BACKEND_ENDPOINT + "-http")
    public ObjectNode processMessage(
            @RequestHeader(INIT_SESSION_ID_KEY) String sessionId,
            @RequestBody String payload) {
        if (!"DISCONNECT".equals(payload)) {
            var userState = userStateCache.get(sessionId);

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
