package ru.smsoft.sui.suibackend.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import lombok.val;
import ru.smsoft.sui.suibackend.message.model.filtering.*;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;
import ru.smsoft.sui.suibackend.utils.Constants;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class FilteringDeserializer extends JsonDeserializer<Filtering> {

    private static final String PREDICATE_KEY = "predicate";
    private static final String OPERATION_KEY = "operation";
    private static final Map<String, FilteringOperation> operationNameByIncomeName = Arrays
            .stream(FilteringOperation.values())
            .collect(Collectors.toMap(
                    operation -> operation.toString().replace("_", "").toUpperCase(),
                    operation -> operation));

    @Override
    public Filtering deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        val codec = parser.getCodec();
        ObjectNode treeNode = codec.readTree(parser);

        // TODO: Bad realisation, refactor
        Class<? extends Filtering> filteringClass;

        if (treeNode.get(PREDICATE_KEY) != null) {
            filteringClass = PredicateFiltering.class;
        } else {
            FilteringOperation operation = null;

            if (treeNode.has(OPERATION_KEY)) {
                val operationNode = treeNode.get(OPERATION_KEY);
                operation = operationNode.isTextual() ? getOperation(operationNode.asText()) : null;

                treeNode.set(
                        OPERATION_KEY,
                        operation != null ? new TextNode(operation.toString()) : operationNode);
            }

            if (Constants.IN_FILTERING_OPERATIONS.contains(operation)) {
                filteringClass = InColumnFiltering.class;
            } else if (operation == FilteringOperation.INTERVAL) {
                filteringClass = IntervalColumnFiltering.class;
            } else {
                filteringClass = SimpleColumnFiltering.class;
            }
        }

        return codec.treeToValue(treeNode, filteringClass);
    }

    private FilteringOperation getOperation(String operation) {
        return Optional
                .ofNullable(operation)
                .map(String::toUpperCase)
                .map(operationNameByIncomeName::get)
                .orElse(null);
    }

}
