package ru.smsoft.sui.suibackend.query;

import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ru.smsoft.sui.suibackend.message.model.ExpandedGroup;
import ru.smsoft.sui.suibackend.message.model.Grouping;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.message.model.filtering.SimpleColumnFiltering;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;
import ru.smsoft.sui.suibackend.model.OrderNullBehavior;
import ru.smsoft.sui.suibackend.model.Subtotal;
import ru.smsoft.sui.suibackend.utils.QueryUtils;
import ru.smsoft.sui.suibackend.utils.Constants;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
public class GroupQueryGenerator {

    @Value("${row-end-position.aggregate}")
    private String rowEndPositionAggregate;

    public String generateQuery(
            String fromWith,
            @org.springframework.lang.NonNull List<Grouping> groupings,
            @org.springframework.lang.NonNull List<ExpandedGroup> expandedGroups,
            @org.springframework.lang.NonNull List<Sorting> sorts,
            long offset,
            long pageSize,
            @org.springframework.lang.NonNull List<Subtotal> subtotals) {
        val start = offset + 1;
        val end = offset + pageSize;
        val withStatements = new LinkedHashMap<String, String>();
        val groupingColumns = groupings
                .stream()
                .map(Grouping::getColumnName)
                .collect(Collectors.toList());
        val expandedGroupsGroupedBySize = expandedGroups
                .stream()
                .collect(Collectors.groupingBy(expandedGroup -> expandedGroup.getGroup().size()));
        val sortMap = sorts
                .stream()
                .collect(Collectors.toMap(Sorting::getColumnName, Function.identity()));

        // generate column filters
        val filtersByColumn = groupings
                .stream()
                .collect(Collectors.toMap(
                        Grouping::getColumnName,
                        grouping -> {
                            val groupingIndex = groupings.indexOf(grouping);
                            val expandedRows = expandedGroupsGroupedBySize
                                    .keySet()
                                    .stream()
                                    .filter(key -> key > groupingIndex)
                                    .map(expandedGroupsGroupedBySize::get)
                                    .flatMap(List::stream)
                                    .collect(Collectors.toList());

                            if (expandedRows.isEmpty()) {
                                return "FALSE";
                            } else {
                                val limit = groupingIndex + 1;

                                return expandedRows
                                        .stream()
                                        .map(expandedRow -> {
                                            val expandedRowElementIndex = new AtomicInteger(0);

                                            return QueryUtils.joinFilters(
                                                    Constants.AND_FILTER_JOINER,
                                                    expandedRow.getGroup()
                                                            .stream()
                                                            .limit(limit)
                                                            .map(element -> new SimpleColumnFiltering(
                                                                    groupingColumns.get(expandedRowElementIndex.getAndIncrement()),
                                                                    FilteringOperation.EQUAL,
                                                                    false,
                                                                    element
                                                            )));
                                        }).distinct()
                                        .collect(Collectors.joining(Constants.OR_FILTER_JOINER, "(", ")"));
                            }
                        }));

        // Popup withStatements
        withStatements.put(Constants.FROM_WITH_NAME, fromWith);
        withStatements.put(Constants.DATA_WITH_NAME, generateGroupedDataWithStatement(groupingColumns, subtotals));
        withStatements.putAll(generateGroupSectionWithStatements(groupingColumns, subtotals, filtersByColumn));
        withStatements.put(Constants.UNION_DATA_WITH_NAME, generateUnionDataWithStatement(groupingColumns, filtersByColumn));
        withStatements.put(Constants.PAGED_DATA_WITH_NAME, generatePagedDataWithStatement(groupingColumns, sortMap, pageSize));
        withStatements.put(Constants.MAX_END_POSITION_WITH_NAME, generateMaxEndPositionWithName());
        withStatements.put(Constants.FROM_TO_POSITIONS_WITH_NAME, generateFromToPositionsWithName(start, end));
        withStatements.put(Constants.PAGED_FILTERED_DATA_WITH_NAME, generatePagedFilteredDataWithStatement());
        withStatements.put(Constants.VISIBLE_GROUPS_WITH_NAME, generateVisibleGroupsWithStatement());
        withStatements.put(
                Constants.EXPANDED_MAX_LEVEL_VISIBLE_GROUPS_WITH_NAME,
                generateExpandedMaxLevelVisibleGroupsWithStatement(groupingColumns.size()));
        withStatements.put(Constants.FIRST_GROUP_OFFSET_WITH_NAME, generateFirstGroupOffsetWithStatement(pageSize, offset));

        return QueryUtils.generateResultQuery(
                withStatements,
                Collections.singleton(
                        String.format(
                                "SELECT (%s) , (%s), (%s), (%s)",
                                "SELECT * FROM " + Constants.MAX_END_POSITION_COLUMN_NAME,
                                "SELECT * FROM " + Constants.FIRST_GROUP_OFFSET_WITH_NAME,
                                generateAggregateToJsonSelectStatement(
                                        Constants.GROUPS_COLUMN_NAME,
                                        Constants.VISIBLE_GROUPS_WITH_NAME,
                                        false),
                                generateAggregateToJsonSelectStatement(
                                        Constants.ROWS_COLUMN_NAME,
                                        generateInnerRowSelectStatement(groupingColumns, sortMap, pageSize),
                                        true))));
    }

    private String generateSubtotalName(Subtotal subtotal) {
        return Constants.SUBTOTAL_PREFIX + subtotal.getColumnName();
    }

    private String generateGroupedDataWithStatement(Collection<String> groupingColumns, Collection<Subtotal> subtotals) {
        val commaSeparatedGroupingColumns = String.join(Constants.COLUMN_SEPARATOR, groupingColumns);

        val groupingIndex = new AtomicInteger(0);
        val commaSeparatedSubtotals = subtotals
                .stream()
                .map(subtotal -> String.format(
                        "%s(%s) AS %s",
                        subtotal.getOperation(),
                        subtotal.getColumnName(),
                        generateSubtotalName(subtotal)))
                .collect(Collectors.joining(Constants.COLUMN_SEPARATOR));

        return "SELECT " +
                groupingColumns.stream()
                        .map(column -> {
                            String format = "GROUPING(%s) AS %s%1$s";
                            if (groupingIndex.getAndIncrement() != 0) {
                                format += Constants.COLUMN_SEPARATOR
                                        + "COUNT(DISTINCT %1$s) + COUNT(DISTINCT CASE WHEN %1$s IS NULL THEN 1 END) AS %1$s%3$s";
                            }
                            return String.format(format, column, Constants.GROUPING_PREFIX, Constants.GROUP_ELEMENTS_SUFFIX);
                        })
                        .collect(Collectors.joining(Constants.COLUMN_SEPARATOR, "", Constants.COLUMN_SEPARATOR)) +
                commaSeparatedGroupingColumns +
                Constants.COLUMN_SEPARATOR +
                (commaSeparatedSubtotals.length() > 0 ? commaSeparatedSubtotals + Constants.COLUMN_SEPARATOR : "") +
                String.format("COUNT(*) AS %s FROM ", Constants.RECORDS_COLUMN_NAME) +
                Constants.FROM_WITH_NAME +
                " GROUP BY GROUPING SETS ( ROLLUP (" +
                commaSeparatedGroupingColumns +
                "))";
    }

    private Map<String, String> generateGroupSectionWithStatements(
            List<String> groupingColumns,
            List<Subtotal> subtotals,
            Map<String, String> filtersByColumn) {
        val groupSectionWithStatements = new LinkedHashMap<String, String>();
        val groupingIndex = new AtomicInteger(0);
        val commaSeparatedGroupingColumns = String.join(Constants.COLUMN_SEPARATOR, groupingColumns);
        val commaSeparatedSubtotals = subtotals
                .stream()
                .map(this::generateSubtotalName)
                .collect(Collectors.joining(Constants.COLUMN_SEPARATOR));

        groupingColumns.forEach(groupingColumn -> {
            val outerIndex = groupingIndex.getAndIncrement();
            val innerGroupingIndex = new AtomicInteger(0);

            String groupWithStatementSB = "SELECT " + commaSeparatedGroupingColumns +
                    Constants.COLUMN_SEPARATOR +
                    String.format("%d AS %s", outerIndex + 1, Constants.LEVEL_COLUMN_NAME) +
                    Constants.COLUMN_SEPARATOR +
                    Constants.RECORDS_COLUMN_NAME +
                    Constants.COLUMN_SEPARATOR +
                    (commaSeparatedSubtotals.length() > 0 ? commaSeparatedSubtotals + Constants.COLUMN_SEPARATOR : "") +
                    (outerIndex + 1 == groupingColumns.size()
                            ? Constants.RECORDS_COLUMN_NAME
                            : String.format("%s%s", groupingColumns.get(outerIndex + 1), Constants.GROUP_ELEMENTS_SUFFIX)) +
                    " AS " +
                    Constants.ELEMENTS_COLUMN_NAME +
                    " FROM " +
                    Constants.DATA_WITH_NAME +
                    " WHERE " +
                    Stream.concat(
                            groupingColumns
                                    .stream()
                                    .map(column -> String.format(
                                            "%s%s = %d",
                                            Constants.GROUPING_PREFIX,
                                            column,
                                            innerGroupingIndex.getAndIncrement() <= outerIndex ? 0 : 1)),
                            outerIndex == 0
                                    ? Stream.empty()
                                    : Stream.of(filtersByColumn.get(groupingColumns.get(outerIndex - 1)))
                    ).collect(Collectors.joining(Constants.AND_FILTER_JOINER));
            groupSectionWithStatements.put(Constants.GROUPED_WITH_PREFIX + groupingColumn, groupWithStatementSB);
        });

        return groupSectionWithStatements;
    }

    private String generateUnionDataWithStatement(
            Collection<String> groupingColumns, Map<String, String> filtersByColumn) {
        return groupingColumns
                .stream()
                .map(groupingColumn -> String.format(
                        "SELECT *, %s AS %s FROM %s%s",
                        filtersByColumn.get(groupingColumn),
                        Constants.EXPANDED_COLUMN_NAME,
                        Constants.GROUPED_WITH_PREFIX,
                        groupingColumn))
                .collect(Collectors.joining(" UNION ALL "));
    }

    private String generatePagedDataWithStatement(
            Collection<String> groupingColumns, Map<String, Sorting> sortMap, long pageSize) {
        return String.format(
                "SELECT *, LAG(%s + 1, 1, 1 :: BIGINT) OVER () AS %s FROM (",
                Constants.END_POSITION_COLUMN_NAME,
                Constants.START_POSITION_COLUMN_NAME) +
                String.format(
                        "SELECT *, %s(%s, %d, %s, %s, %d)",
                        rowEndPositionAggregate,
                        Constants.EXPANDED_COLUMN_NAME,
                        pageSize,
                        Constants.ELEMENTS_COLUMN_NAME,
                        Constants.LEVEL_COLUMN_NAME,
                        groupingColumns.size()) +
                " OVER (ORDER BY " +
                generateGroupingColumnOrderStatement(groupingColumns, sortMap) +
                String.format(", %s) AS %s FROM ", Constants.LEVEL_COLUMN_NAME, Constants.END_POSITION_COLUMN_NAME) +
                Constants.UNION_DATA_WITH_NAME +
                ") t";
    }

    private String generateMaxEndPositionWithName() {
        return String.format(
                "SELECT MAX(%s) AS %s FROM %s",
                Constants.END_POSITION_COLUMN_NAME,
                Constants.MAX_END_POSITION_COLUMN_NAME,
                Constants.PAGED_DATA_WITH_NAME);

    }

    private String generateFromToPositionsWithName(long pageStart, long pageEnd) {
        return String.format(
                "SELECT LEAST(%d, GREATEST((%s - 1), 0) / %d * %3$d + 1) AS %s, LEAST(%d, %2$s) AS %s FROM %s",
                pageStart,
                Constants.MAX_END_POSITION_COLUMN_NAME,
                pageEnd - pageStart + 1,
                Constants.FROM_POSITION_COLUMN_NAME,
                pageEnd,
                Constants.TO_POSITION_COLUMN_NAME,
                Constants.MAX_END_POSITION_WITH_NAME);
    }

    private String generatePagedFilteredDataWithStatement() {
        return String.format(
                "SELECT %s.* FROM %1$s, %s WHERE GREATEST(%s, %s) <= LEAST(%s, %s)",
                Constants.PAGED_DATA_WITH_NAME,
                Constants.FROM_TO_POSITIONS_WITH_NAME,
                Constants.FROM_POSITION_COLUMN_NAME,
                Constants.START_POSITION_COLUMN_NAME,
                Constants.TO_POSITION_COLUMN_NAME,
                Constants.END_POSITION_COLUMN_NAME);
    }

    private String generateVisibleGroupsWithStatement() {
        return String.format("SELECT * FROM %s", Constants.PAGED_FILTERED_DATA_WITH_NAME) +
                " UNION SELECT * FROM (" +
                String.format(
                        "SELECT DISTINCT ON (t1.%s) t1.* FROM %s t1, (SELECT %1$s FROM %s LIMIT 1) t2, %s t3",
                        Constants.LEVEL_COLUMN_NAME,
                        Constants.PAGED_DATA_WITH_NAME,
                        Constants.PAGED_FILTERED_DATA_WITH_NAME,
                        Constants.FROM_TO_POSITIONS_WITH_NAME) +
                String.format(
                        " WHERE t1.%s < t2.%1$s AND t1.%s < t3.%s",
                        Constants.LEVEL_COLUMN_NAME,
                        Constants.END_POSITION_COLUMN_NAME,
                        Constants.FROM_POSITION_COLUMN_NAME) +
                String.format(
                        " ORDER BY t1.%1$s, t1.%2$s DESC) t ORDER BY %2$s",
                        Constants.LEVEL_COLUMN_NAME,
                        Constants.END_POSITION_COLUMN_NAME);
    }

    private String generateExpandedMaxLevelVisibleGroupsWithStatement(int groupingSize) {
        return String.format(
                "SELECT * FROM %s WHERE __level = %d AND %s IS TRUE",
                Constants.VISIBLE_GROUPS_WITH_NAME,
                groupingSize,
                Constants.EXPANDED_COLUMN_NAME);
    }

    private String generateFirstGroupOffsetWithStatement(long pageSize, long offset) {
        val pageOffsetFormula = String.format(
                "t2.%s - t1.%s - GREATEST(0, (t2.%1$s - 1) / %d - t1.%2$s / %3$d) * t1.%s",
                Constants.OFFSET_COLUMN_NAME,
                Constants.START_POSITION_COLUMN_NAME,
                pageSize,
                Constants.LEVEL_COLUMN_NAME);

        return "SELECT" +
                String.format(
                        " CASE WHEN t1.%s > t2.%s THEN 0 ELSE %s END AS %2$s",
                        Constants.START_POSITION_COLUMN_NAME,
                        Constants.OFFSET_COLUMN_NAME,
                        pageOffsetFormula) +
                String.format(
                        " FROM (SELECT * FROM %s LIMIT 1) t1, (SELECT LEAST(%d, MAX(%s) / %d * %4$d) AS %s FROM %1$s) t2",
                        Constants.EXPANDED_MAX_LEVEL_VISIBLE_GROUPS_WITH_NAME,
                        offset,
                        Constants.END_POSITION_COLUMN_NAME,
                        pageSize,
                        Constants.OFFSET_COLUMN_NAME);
    }

    private String generateInnerRowSelectStatement(
            Collection<String> groupingColumns,
            Map<String, Sorting> sortMap,
            long pageSize) {
        return String.format(
                "SELECT %s.* FROM %1$s INNER JOIN %s ON (%s) ORDER BY %s OFFSET %s LIMIT %s",
                Constants.FROM_WITH_NAME,
                Constants.EXPANDED_MAX_LEVEL_VISIBLE_GROUPS_WITH_NAME,
                groupingColumns
                        .stream()
                        .map(column -> String.format(
                                "((%s.%s IS NULL AND %s.%2$s IS NULL) OR %1$s.%2$s = %3$s.%2$s)",
                                Constants.FROM_WITH_NAME,
                                column,
                                Constants.EXPANDED_MAX_LEVEL_VISIBLE_GROUPS_WITH_NAME))
                        .collect(Collectors.joining(Constants.AND_FILTER_JOINER)),
                String.format(
                        "%s, %s",
                        generateGroupingColumnOrderStatement(groupingColumns, sortMap),
                        Constants.ROW_NUMBER_COLUMN_NAME),
                String.format("(SELECT %s FROM %s)", Constants.OFFSET_COLUMN_NAME, Constants.FIRST_GROUP_OFFSET_WITH_NAME),
                String.format("(SELECT %d - COUNT(*) FROM %s)", pageSize, Constants.VISIBLE_GROUPS_WITH_NAME));
    }

    private String generateAggregateToJsonSelectStatement(String alias, String from, boolean addBrackets) {
        return String.format(
                "SELECT array_to_json(array_agg(row_to_json(t))) AS %s FROM %s t",
                alias,
                addBrackets ? String.format("(%s)", from) : from);
    }

    private String generateGroupingColumnOrderStatement(Collection<String> groupingColumns, Map<String, Sorting> sortMap) {
        return QueryUtils.generateOrderByInnerStatement(
                groupingColumns
                        .stream()
                        .map(groupingColumn -> Optional
                                .ofNullable(sortMap.get(groupingColumn))
                                .orElse(Sorting.builder().columnName(groupingColumn).build()))
                        .collect(Collectors.toList()),
                OrderNullBehavior.FIRST);
    }

}
