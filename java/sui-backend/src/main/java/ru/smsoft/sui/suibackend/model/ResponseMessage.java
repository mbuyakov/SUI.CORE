package ru.smsoft.sui.suibackend.model;

import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;
import ru.smsoft.sui.suibackend.message.response.ResponseMessageType;

@Data
@Builder(toBuilder = true)
public class ResponseMessage {

    private @NonNull ObjectNode data;
    private @NonNull ResponseMessageType type;

}
