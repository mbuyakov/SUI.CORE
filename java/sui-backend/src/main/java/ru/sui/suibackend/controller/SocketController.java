package ru.sui.suibackend.controller;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import lombok.var;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import ru.sui.suibackend.message.response.ResponseMessageType;
import ru.sui.suibackend.model.UserState;
import ru.sui.suibackend.service.MessageHandlerService;

import java.security.Principal;
import java.util.HashMap;
import java.util.Optional;

import static ru.sui.suibackend.utils.Constants.*;

@Controller
@Slf4j
@RequiredArgsConstructor
public class SocketController {

  @Autowired
  private SimpMessageSendingOperations messagingTemplate;
  @Autowired
  private MessageHandlerService messageHandlerService;

  @MessageMapping("/data")
  public void processMessage(SimpMessageHeaderAccessor headerAccessor, Message<byte[]> message, Principal principal) {
    if (headerAccessor.getSessionAttributes() == null) {
      headerAccessor.setSessionAttributes(new HashMap<>());
    }

    var userState = getUserState(headerAccessor);

    if (userState == null) {
      userState = new UserState();
      headerAccessor.getSessionAttributes().put(USER_STATE_KEY, userState);
    }

    val responseMessage = messageHandlerService.processMessage(new String(message.getPayload()), userState);

    sendMessage(
      headerAccessor,
      principal,
      responseMessage.getType(),
      responseMessage.getData());
  }

  private UserState getUserState(SimpMessageHeaderAccessor accessor) {
    return Optional
      .ofNullable(accessor.getSessionAttributes())
      .map(attributes -> (UserState) attributes.get(USER_STATE_KEY))
      .orElse(null);
  }

  private void sendMessage(
    SimpMessageHeaderAccessor headerAccessor,
    Principal principal,
    @org.springframework.lang.NonNull ResponseMessageType type,
    ObjectNode content) {
    content.set(TYPE_KEY, new TextNode(type.toString()));

    val messageId = Optional
      .ofNullable(headerAccessor.getNativeHeader(MESSAGE_ID_KEY))
      .map(list -> list.isEmpty() ? null : list.get(0))
      .orElse(null);

    //noinspection ConstantConditions
    messagingTemplate.convertAndSendToUser(
      principal.getName(),
      SEND_TO_DESTINATION + "/" + headerAccessor.getSessionAttributes().get(INIT_SESSION_ID_KEY),
      content.set(MESSAGE_ID_KEY, new TextNode(messageId)));
  }

}
