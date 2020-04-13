package ru.smsoft.sui.suientity.converter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;

import javax.persistence.AttributeConverter;
import java.io.IOException;

public class JsonNodeConverter<T extends JsonNode> implements AttributeConverter<T, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(T jsonNode) {
        return jsonNode != null
                ? jsonNode.toString()
                : null;
    }

    @SuppressWarnings("unchecked")
    @Override
    @SneakyThrows(IOException.class)
    public T convertToEntityAttribute(String dataString) {
        return dataString != null
                ? (T) MAPPER.readTree(dataString)
                : null;
    }

}
