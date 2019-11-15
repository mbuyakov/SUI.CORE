package ru.smsoft.sui.suibackend.config;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import ru.smsoft.sui.suibackend.security.AuthChannelInterceptorAdapter;

@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthenticationSecurityConfig implements WebSocketMessageBrokerConfigurer {

    @NonNull
    private AuthChannelInterceptorAdapter authChannelInterceptorAdapter;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/table-backend").setAllowedOrigins("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/queue");
        // use setApplicationDestinationPrefixes to add prefix to send destination
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.addDecoratorFactory(ReconnectionWebSocketHandlerDecorator::new);
    }

    @Override
    public void configureClientOutboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(@org.springframework.lang.NonNull Message<?> message, MessageChannel channel) {
                val accessor = MessageHeaderAccessor.getAccessor(message, MessageHeaderAccessor.class);

                if (accessor instanceof SimpMessageHeaderAccessor) {
                    val simpMessageHeaderAccessor = (SimpMessageHeaderAccessor) accessor;

                    if (simpMessageHeaderAccessor.getSessionId() != null
                            && simpMessageHeaderAccessor.getMessageType() == SimpMessageType.CONNECT_ACK) {
                        // Put session id to CONNECTED message payload
                        return new GenericMessage<>(
                                simpMessageHeaderAccessor.getSessionId().getBytes(),
                                message.getHeaders());
                    }
                }

                return message;
            }

        });
    }

    @Override
    public void configureClientInboundChannel(final ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptorAdapter);
    }

}
