package ru.smsoft.sui.suibackend.config;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static ru.smsoft.sui.suibackend.utils.Constants.*;

@Slf4j
public class ReconnectionWebSocketHandlerDecorator extends WebSocketHandlerDecorator {

    private Cache<String, WebSocketSession> closedSessionCache = CacheBuilder
            .newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build();

    ReconnectionWebSocketHandlerDecorator(WebSocketHandler delegate) {
        super(delegate);
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        val currentSessionAttributes = session.getAttributes();

        Optional.of(session)
                .map(WebSocketSession::getUri)
                .map(uri -> URLEncodedUtils.parse(session.getUri(), StandardCharsets.UTF_8))
                .flatMap(params -> params
                        .stream()
                        .filter(pair -> PREV_SESSION_ID_KEY.equals(pair.getName()))
                        .findFirst())
                .map(NameValuePair::getValue)
                .map(closedSessionCache::getIfPresent)
                .ifPresent(prevSession -> {
                    val previousSessionAttributes = prevSession.getAttributes();

                    currentSessionAttributes.put(USER_STATE_KEY, previousSessionAttributes.get(USER_STATE_KEY));
                    currentSessionAttributes.put(INIT_SESSION_ID_KEY, previousSessionAttributes.get(INIT_SESSION_ID_KEY));
                });

        if (currentSessionAttributes.get(INIT_SESSION_ID_KEY) == null) {
            currentSessionAttributes.put(INIT_SESSION_ID_KEY, session.getId());
        }

        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus closeStatus)
            throws Exception {
        closedSessionCache.put(session.getId(), session);
        super.afterConnectionClosed(session, closeStatus);
    }

}
