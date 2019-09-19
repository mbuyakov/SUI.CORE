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
import ru.smsoft.sui.suibackend.model.Column;
import ru.smsoft.sui.suibackend.model.OrderNullBehavior;
import ru.smsoft.sui.suibackend.utils.QueryUtils;
import ru.smsoft.sui.suibackend.utils.Constants;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;
import ru.smsoft.sui.suisecurity.utils.MetaSchemaUtils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
@Slf4j
public class FromWithGenerator {

    private static final String RENDER_TYPE_KEY = "renderType";
    private static final String ROUND_COUNT_KEY = "roundCount";
    private static final String ROUND_RENDER_TYPE = "round";

    public String generateMainWith(
            String fullRequestTableInfoName,
            Collection<Column> columns,
            Collection<Filtering> filters,
            Collection<Sorting> sortings,
            Collection<String> selections) {
        val columnMap = columns
                .stream()
                .collect(Collectors.toMap(
                        column -> column.getColumnInfo().getColumnName(),
                        Function.identity()));
        val visibleColumns = columns
                .stream()
                .filter(Column::isVisible)
                .collect(Collectors.toList());
        val referenceRenderColumns = visibleColumns
                .stream()
                .filter(column -> column.getRenderColumnAlias() != null)
                .collect(Collectors.toList());

        val referencedNameColumnInfoByReferenceColumnName = new HashMap<String, ColumnInfo>();
        val joins = new ArrayList<String>();
        val joinAliases = new HashMap<String, String>();

        referenceRenderColumns.forEach(referenceRenderColumn -> {
            val referenceRenderColumnInfoName = referenceRenderColumn.getColumnInfo().getColumnName();
            var columnInfo = referenceRenderColumn.getColumnInfo();
            val renderColumnInfo = referenceRenderColumn.getRenderColumnInfo();

            referencedNameColumnInfoByReferenceColumnName.put(referenceRenderColumnInfoName, renderColumnInfo);

            var lastJoinTableAlias = MetaSchemaUtils.getFullTableInfoName(columnInfo.getTableInfo());

            while (true) {
                val referencedColumnInfo = MetaSchemaUtils.getReferencedColumnInfo(columnInfo);
                val joinTableAlias = "t" + joins.size();

                joins.add(
                        String.format(
                                "LEFT JOIN %s AS %s ON %2$s.%s = %s.%s",
                                MetaSchemaUtils.getFullTableInfoName(
                                        Objects.requireNonNull(referencedColumnInfo).getTableInfo()),
                                joinTableAlias,
                                referencedColumnInfo.getColumnName(),
                                lastJoinTableAlias,
                                columnInfo.getColumnName()));

                columnInfo = referencedColumnInfo.getTableInfo().getForeignLinkColumnInfo();

                if (renderColumnInfo.equals(columnInfo)) {
                    joinAliases.put(referenceRenderColumnInfoName, joinTableAlias);
                    break;
                } else {
                    lastJoinTableAlias = joinTableAlias;
                }
            }
        });

        String additionalColumns = referenceRenderColumns
                .stream()
                .map(referenceRenderColumn -> {
                    val referenceColumnName = referenceRenderColumn.getColumnInfo().getColumnName();
                    val renderColumnInfo = referencedNameColumnInfoByReferenceColumnName.get(referenceColumnName);
                    val joinAlias = joinAliases.get(referenceColumnName);

                    return String.format(
                            "COALESCE(%s.%s::TEXT, %s::TEXT) AS %s",
                            joinAlias,
                            renderColumnInfo.getColumnName(),
                            MetaSchemaUtils.getFullColumnInfoName(referenceRenderColumn.getColumnInfo()),
                            referenceRenderColumn.getRenderColumnAlias());
                })
                .collect(Collectors.joining(Constants.COLUMN_SEPARATOR));

        val requestColumnInfoByName =
                MetaSchemaUtils.getColumnInfoByNameMap(
                        columns.stream().map(Column::getColumnInfo).collect(Collectors.toList()));

        LinkedList<Sorting> sorts = Optional
                .ofNullable(sortings)
                .orElseGet(Collections::emptyList)
                .stream()
                .map(sorting -> {
                    val column = Objects.requireNonNull(columnMap.get(sorting.getColumnName()));

                    return sorting
                            .toBuilder()
                            .columnName((column.getRenderColumnAlias() != null)
                                ? column.getRenderColumnAlias()
                                : sorting.getColumnName())
                            .build();
                })
                .collect(Collectors.toCollection(LinkedList::new));

        sorts.add(Sorting.builder().columnName("id").direction(SortingDirection.DESC).build());

        if (!CollectionUtils.isEmpty(selections)) {
            sorts.addFirst(new Sorting(Constants.SELECTED_COLUMN_NAME, SortingDirection.DESC));
        }

        val resultQuerySB = new StringBuilder();

        resultQuerySB.append(
                String.format(
                        "SELECT %s %s %s FROM %s\n",
                        visibleColumns.stream()
                                .map(Column::getColumnInfo)
                                .map(columnInfo -> String.format(
                                        "%s AS %s",
                                        getSelectExpression(columnInfo),
                                        columnInfo.getColumnName()))
                                .collect(Collectors.joining(Constants.COLUMN_SEPARATOR)),
                        referencedNameColumnInfoByReferenceColumnName.isEmpty()
                                ? ""
                                : Constants.COLUMN_SEPARATOR + additionalColumns,
                        CollectionUtils.isEmpty(selections)
                                ? ""
                                : Constants.COLUMN_SEPARATOR + generateSelectionColumn(fullRequestTableInfoName, selections),
                        fullRequestTableInfoName));
        resultQuerySB.append(String.join("\n", joins));

        // Add WHERE statement
        if (filters != null && !filters.isEmpty()) {
            resultQuerySB.append("\nWHERE ");
            resultQuerySB.append(
                    QueryUtils.joinFilters(
                            Constants.AND_FILTER_JOINER,
                            filters,
                            columnFiltering -> getStatementColumn(
                                    requestColumnInfoByName,
                                    referencedNameColumnInfoByReferenceColumnName,
                                    joinAliases,
                                    columnFiltering.getColumnName(),
                                    columnFiltering.isRaw())));
        }

        return String.format(
                "SELECT tmp.*, row_number() OVER(ORDER BY %s) AS %s FROM (%s) tmp ORDER BY %2$s",
                QueryUtils.generateOrderByInnerStatement(sorts, (OrderNullBehavior) null),
                Constants.ROW_NUMBER_COLUMN_NAME,
                resultQuerySB.toString());
    }

    private String getStatementColumn(
            Map<String, ColumnInfo> columnInfoByName,
            Map<String, ColumnInfo> nameColumnByReferenceColumn,
            Map<String, String> joinAliases,
            String name,
            boolean raw) {
        ColumnInfo columnInfo;
        String result;

        if (!raw && nameColumnByReferenceColumn.containsKey(name)) {
            columnInfo = nameColumnByReferenceColumn.get(name);
            result = String.format("%s.%s", joinAliases.get(name), columnInfo.getColumnName());
        } else {
            columnInfo = columnInfoByName.get(name);
            result = Optional
                    .ofNullable(columnInfo)
                    .map(MetaSchemaUtils::getFullColumnInfoName)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid column name " + name));
        }

        return result + getCastType(columnInfo);
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
                Constants.SELECTED_COLUMN_NAME);
    }

    private String generateSelectionSQLArray(@NonNull Collection<String> selections) {
        return String.format(
                "ARRAY[%s]::TEXT[]",
                selections
                        .stream()
                        .map(selection -> String.format("'%s'", selection))
                        .collect(Collectors.joining(Constants.COLUMN_SEPARATOR)));
    }

}
