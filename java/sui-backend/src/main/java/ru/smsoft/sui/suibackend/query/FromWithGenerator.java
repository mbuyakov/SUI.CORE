package ru.smsoft.sui.suibackend.query;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import lombok.var;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.message.model.SortingDirection;
import ru.smsoft.sui.suibackend.message.model.filtering.Filtering;
import ru.smsoft.sui.suibackend.model.query.Column;
import ru.smsoft.sui.suibackend.model.query.FromGraph;
import ru.smsoft.sui.suibackend.model.query.OrderNullBehavior;
import ru.smsoft.sui.suibackend.utils.QueryUtils;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;
import ru.smsoft.sui.suisecurity.utils.MetaSchemaUtils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static ru.smsoft.sui.suibackend.utils.Constants.*;


@Service
@Slf4j
// TODO: Набор костылей, переписать
public class FromWithGenerator {

    private static final String RENDER_TYPE_KEY = "renderType";
    private static final String ROUND_COUNT_KEY = "roundCount";
    private static final String ROUND_RENDER_TYPE = "round";

    public String generateMainWith(
            FromGraph fromGraph,
            Collection<Column> columns,
            Collection<Filtering> filters,
            Collection<Sorting> sortings,
            Collection<String> selections) {
        val visibleColumns = columns
                .stream()
                .filter(Column::isVisible)
                .collect(Collectors.toList());
        val referenceRenderColumns = visibleColumns
                .stream()
                .filter(column -> column.getRenderColumn() != null)
                .collect(Collectors.toList());
        val renderColumns = referenceRenderColumns
                .stream()
                .map(Column::getRenderColumn)
                .collect(Collectors.toList());
        val columnMap = columns
                .stream()
                .filter(column -> !renderColumns.contains(column))
                .collect(Collectors.toMap(
                        column -> column.getColumnInfo().getColumnName(),
                        Function.identity()));

        String additionalColumns = referenceRenderColumns
                .stream()
                .map(column -> {
                    val renderColumn = column.getRenderColumn();

                    return String.format(
                            "COALESCE(%s.%s::TEXT, %s::TEXT) AS %s",
                            renderColumn.getFrom().getAlias(),
                            renderColumn.getColumnName(),
                            column,
                            renderColumn.getAlias());
                })
                .collect(Collectors.joining(COLUMN_SEPARATOR));

        LinkedList<Sorting> sorts = Optional
                .ofNullable(sortings)
                .orElseGet(Collections::emptyList)
                .stream()
                .map(sorting -> {
                    val column = Objects.requireNonNull(columnMap.get(sorting.getColumnName()));

                    return sorting
                            .toBuilder()
                            .columnName((column.getRenderColumn() != null)
                                ? column.getRenderColumn().getName()
                                : sorting.getColumnName())
                            .build();
                })
                .collect(Collectors.toCollection(LinkedList::new));

        if (sorts.stream().noneMatch(sort -> "id".equals(sort.getColumnName()))) {
          sorts.add(Sorting.builder().columnName("id").direction(SortingDirection.DESC).build());
        }

        if (!CollectionUtils.isEmpty(selections)) {
            sorts.addFirst(new Sorting(SELECTED_COLUMN_NAME, SortingDirection.DESC));
        }

        val resultQuerySB = new StringBuilder();

        resultQuerySB.append(
                String.format(
                        "SELECT %s %s %s",
                        visibleColumns.stream()
                                .filter(column -> !renderColumns.contains(column))
                                .map(Column::getColumnInfo)
                                .map(columnInfo -> String.format(
                                        "%s AS %s",
                                        getSelectExpression(columnInfo),
                                        columnInfo.getColumnName()))
                                .collect(Collectors.joining(COLUMN_SEPARATOR)),
                        additionalColumns.isEmpty()
                                ? ""
                                : COLUMN_SEPARATOR + additionalColumns,
                        CollectionUtils.isEmpty(selections)
                                ? ""
                                : COLUMN_SEPARATOR + generateSelectionColumn(
                                        fromGraph.getFromTable().toString(),
                                        selections)));

        resultQuerySB.append('\n');
        resultQuerySB.append(fromGraph);

        // Add WHERE statement
        if (filters != null && !filters.isEmpty()) {
            resultQuerySB.append("\nWHERE ");
            resultQuerySB.append(
                    QueryUtils.joinFilters(
                            AND_FILTER_JOINER,
                            filters,
                            columnFiltering -> getStatementColumn(
                                    columnMap,
                                    columnFiltering.getColumnName(),
                                    columnFiltering.isRaw())));
        }

        // Add ORDER BY statement
        resultQuerySB.append("\nORDER BY ");
        resultQuerySB.append(QueryUtils.generateOrderByInnerStatement(sorts, OrderNullBehavior.LAST));

        return String.format(
                "SELECT tmp.*, row_number() OVER() AS %s FROM (%s) tmp",
                ROW_NUMBER_COLUMN_NAME,
                resultQuerySB.toString());
    }

    private String getStatementColumn(
            Map<String, Column> columnMap,
            String name,
            boolean raw) {
        String result;
        Column column = columnMap.get(name);

        if (!raw && column.getRenderColumn() != null) {
            column = column.getRenderColumn();
            result = String.format("%s.%s", column.getFrom(), column.getColumnName());
        } else {
            result = column.toString();
        }

        return result + getCastType(column.getColumnInfo());
    }

    private String getSelectExpression(ColumnInfo columnInfo) {
        var selectExpression = String.format(
                "%s%s",
                MetaSchemaUtils.getFullColumnInfoName(columnInfo),
                getCastType(columnInfo));
        val renderParam = columnInfo.getParsedTableRenderParams();

        if (renderParam != null
                && renderParam.hasNonNull(RENDER_TYPE_KEY)
                && ROUND_RENDER_TYPE.equals(renderParam.get(RENDER_TYPE_KEY).asText())) {
            selectExpression = String.format(
                    "ROUND((%s)::NUMERIC, %d)",
                    selectExpression,
                    Optional.ofNullable(renderParam.get(ROUND_COUNT_KEY)).map(JsonNode::asInt).orElse(0));
        }

        return selectExpression;
    }

    private @NonNull String getCastType(ColumnInfo columnInfo) {
        val type = Optional
                .ofNullable(columnInfo.getColumnType())
                .map(String::toLowerCase)
                .orElse("");
        String castType = null;

        switch (type) {
            case "json":
            case "jsonb":
                castType = "text";
        }

        return Optional
                .ofNullable(castType)
                .map(castTypeString -> "::" + castTypeString)
                .orElse("");
    }

    private String generateSelectionColumn(
            String fullRequestTableInfoName,
            @NonNull Collection<String> selections) {
        return String.format(
                "%s.id::TEXT = ANY(%s) AS %s",
                fullRequestTableInfoName,
                generateSelectionSQLArray(selections),
                SELECTED_COLUMN_NAME);
    }

    private String generateSelectionSQLArray(@NonNull Collection<String> selections) {
        return String.format(
                "ARRAY[%s]::TEXT[]",
                selections
                        .stream()
                        .map(selection -> String.format("'%s'", selection))
                        .collect(Collectors.joining(COLUMN_SEPARATOR)));
    }

}
