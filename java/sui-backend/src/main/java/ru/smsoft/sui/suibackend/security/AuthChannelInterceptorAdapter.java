package ru.smsoft.sui.suibackend.security;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import ru.smsoft.sui.suisecurity.security.JwtAuthenticationService;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthChannelInterceptorAdapter implements ChannelInterceptor {

    @NonNull
    private JwtAuthenticationService jwtAuthenticationService;

    @Override
    public Message<?> preSend(@org.springframework.lang.NonNull final Message<?> message, final MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

      if (accessor != null && StompCommand.CONNECT == accessor.getCommand()) {
        accessor.setUser(
                jwtAuthenticationService.getAuthentication(
                        accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION)));
      }

        return message;
    }

}
