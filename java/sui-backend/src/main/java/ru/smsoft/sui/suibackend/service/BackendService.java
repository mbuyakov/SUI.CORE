package ru.smsoft.sui.suibackend.service;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.json.JSONArray;
import org.json.JSONObject;
import org.postgresql.util.PGobject;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Controller;
import ru.smsoft.sui.suibackend.message.model.ExpandedGroup;
import ru.smsoft.sui.suibackend.message.model.Grouping;
import ru.smsoft.sui.suibackend.message.model.Sorting;
import ru.smsoft.sui.suibackend.message.model.filtering.Filtering;
import ru.smsoft.sui.suibackend.model.PageData;
import ru.smsoft.sui.suibackend.model.UserState;
import ru.smsoft.sui.suibackend.model.query.Column;
import ru.smsoft.sui.suibackend.model.query.Subtotal;
import ru.smsoft.sui.suibackend.query.FromWithGenerator;
import ru.smsoft.sui.suibackend.query.GroupQueryGenerator;
import ru.smsoft.sui.suibackend.utils.JsonUtils;
import ru.smsoft.sui.suibackend.utils.QueryUtils;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static ru.smsoft.sui.suibackend.utils.Constants.*;

@Slf4j
@Controller
@RequiredArgsConstructor
public class BackendService {

  private final static Set<String> groupResponseIncludedColumns =
          Stream.of(RECORDS_COLUMN_NAME, CHILDREN_FIELD_NAME).collect(Collectors.toSet());

  @NonNull
  private FromWithGenerator fromWithGenerator;
  @NonNull
  private GroupQueryGenerator groupQueryGenerator;
  @NonNull
  private TreeGenerator treeGenerator;
  @NonNull
  private JdbcTemplate jdbcTemplate;

  public PageData getData(UserState userState) {
    val metaData = userState.getMetaData();

    val columnMap = metaData
      .getColumns()
      .stream()
      .collect(Collectors.toMap(
        // TODO: Костыль
        Column::getName,
        Function.identity()));

    if (metaData.getFromGraph() == null || columnMap.values().stream().noneMatch(Column::isVisible)) {
      return new PageData();
    }

    val fromWith = fromWithGenerator.generateMainWith(
      metaData.getFromGraph(),
      columnMap.values(),
      extractAllFilters(userState),
      userState.getSorts(),
      userState.getSelection()
    );
    val grouping = userState.getGroupings();

    if (grouping != null && !grouping.isEmpty()) {
      return getGroupedData(
        fromWith,
        columnMap,
        userState.getOffset(),
        userState.getPageSize(),
        grouping,
        Optional.ofNullable(userState.getExpandedGroups()).orElse(Collections.emptyList()),
        userState.getSorts()
      );
    } else {
      val withStatements = new LinkedHashMap<String, String>();
      withStatements.put(FROM_WITH_NAME, fromWith);
      withStatements.put(
        OFFSET_WITH_NAME,
        String.format(
          "SELECT %s, LEAST(FLOOR((%1$s - 1) / %d) * %2$d, %d) AS %s" +
            " FROM (SELECT COALESCE(COUNT(*), 0) AS %1$s FROM %s) __total",
          TOTAL_COUNT_COLUMN_NAME,
          userState.getPageSize(),
          userState.getOffset(),
          OFFSET_COLUMN_NAME,
          FROM_WITH_NAME
        )
      );


      val data = jdbcTemplate.queryForMap(
        QueryUtils.generateResultQuery(
          withStatements,
          Collections.singleton(
            String.format(
              "SELECT (%s) , (%s)",
              String.format("SELECT %s FROM %s", TOTAL_COUNT_COLUMN_NAME, OFFSET_COLUMN_NAME),
              String.format(
                "SELECT json_agg(row_to_json(__tmp)) AS %s FROM (SELECT * FROM %s LIMIT %d OFFSET (%s)) __tmp",
                ROWS_COLUMN_NAME,
                FROM_WITH_NAME,
                userState.getPageSize(),
                String.format("SELECT %s FROM %s", OFFSET_COLUMN_NAME, OFFSET_COLUMN_NAME)
              )
            )
          )
        )
      );

      val rows = parseJsonArrayPgObjectToJsonObjectCollection(((PGobject) data.get(ROWS_COLUMN_NAME)));
      formatDataQueryResult(columnMap.values(), rows);

      return PageData
        .builder()
        .data(new JSONArray(rows))
        .totalCount((Long) data.get(TOTAL_COUNT_COLUMN_NAME))
        .build();
    }
  }

  private PageData getGroupedData(
    String fromWith,
    Map<String, Column> columnByColumnInfoName,
    long offset,
    long pageSize,
    @org.springframework.lang.NonNull List<Grouping> groupings,
    @org.springframework.lang.NonNull List<ExpandedGroup> expandedGroups,
    List<Sorting> sorts) {
    val formattedGroupings = formatCollectionColumnNames(
      groupings,
      columnByColumnInfoName,
      Grouping::getColumnName,
      (grouping, columnName) -> grouping.toBuilder().columnName(columnName).build());
    val formattedSorting = formatCollectionColumnNames(
      sorts,
      columnByColumnInfoName,
      Sorting::getColumnName,
      (sorting, columnName) -> sorting.toBuilder().columnName(columnName).build());
    val groupingColumns = formattedGroupings
      .stream()
      .map(Grouping::getColumnName)
      .collect(Collectors.toList());

    val groupQueryResult = jdbcTemplate.queryForMap(
      groupQueryGenerator.generateQuery(
        fromWith,
        formattedGroupings,
        formatExpandedGroups(groupings, expandedGroups, columnByColumnInfoName),
        formattedSorting,
        offset,
        pageSize,
        generateSubtotals(columnByColumnInfoName.values())));

    val visibleRows = parseJsonArrayPgObjectToJsonObjectCollection(((PGobject) groupQueryResult.get(ROWS_COLUMN_NAME)));
    formatDataQueryResult(columnByColumnInfoName.values(), visibleRows);
    val visibleGroups = parseJsonArrayPgObjectToJsonObjectCollection(((PGobject) groupQueryResult.get(GROUPS_COLUMN_NAME)));
    val expandedMaxLevelGroups = visibleGroups
      .stream()
      .filter(group ->
        group.getInt(LEVEL_COLUMN_NAME) == formattedGroupings.size() && group.optBoolean(EXPANDED_COLUMN_NAME))
      .collect(Collectors.toList());
    val firstGroupOffset = (Long) groupQueryResult.get(OFFSET_COLUMN_NAME);
    val expandedMaxLevelGroupIndex = new AtomicInteger(0);

    expandedMaxLevelGroups.forEach(group -> {
      int elements = group.getInt(ELEMENTS_COLUMN_NAME);
      if (expandedMaxLevelGroupIndex.getAndIncrement() == 0) {
        elements -= firstGroupOffset;
      }
      val groupVisibleRows = visibleRows.subList(0, Math.min(elements, visibleRows.size()));
      group.put(CHILDREN_FIELD_NAME, new ArrayList<>(groupVisibleRows));
      visibleRows.removeAll(groupVisibleRows);
    });

    val formattedVisibleGroups = visibleGroups
      .stream()
      .map(JsonUtils.JSON_VALUE_FORMATTER)
      .collect(Collectors.toList());

    treeGenerator.setChildren(formattedVisibleGroups, 0, null);

    val firstLevelGroups = formattedVisibleGroups.stream()
      .filter(group -> group.getInt(LEVEL_COLUMN_NAME) == 1)
      .collect(Collectors.toList());

    formatGroups(formattedVisibleGroups, groupingColumns);

    return PageData
      .builder()
      .totalCount((long) Optional
        .ofNullable(groupQueryResult.get(MAX_END_POSITION_COLUMN_NAME))
        .orElse(0L))
      .data(new JSONArray(firstLevelGroups))
      .build();
  }

  private List<Subtotal> generateSubtotals(Collection<Column> columns) {
    val renderColumns = columns
      .stream()
      .map(Column::getRenderColumn)
      .filter(Objects::nonNull)
      .collect(Collectors.toSet());

    return columns
      .stream()
      .filter(column -> !renderColumns.contains(column))
      .map(column -> {
        val columnInfo = column.getColumnInfo();
        String operation = null;

        if (column.getRenderColumn() != null) {
          val renderColumnInfo = column.getRenderColumn().getColumnInfo();

          if (renderColumnInfo.getSubtotalType() != null) {
            operation = renderColumnInfo.getSubtotalType().getExpression();
          }
        } else if (columnInfo.getSubtotalType() != null) {
          operation = columnInfo.getSubtotalType().getExpression();
        }

        return (operation != null)
          ? Subtotal.builder().columnName(columnInfo.getColumnName()).operation(operation).build()
          : null;
      })
      .filter(Objects::nonNull)
      .collect(Collectors.toList());
  }

  private List<JSONObject> parseJsonArrayPgObjectToJsonObjectCollection(PGobject pgObject) {
    try {
      return StreamSupport
        .stream(new JSONArray(pgObject.getValue()).spliterator(), false)
        .map(JSONObject.class::cast)
        .collect(Collectors.toList());
    } catch (Exception exception) {
      log.warn("Can not parse jsonArray: " + pgObject);
      return Collections.emptyList();
    }
  }

  private void formatGroups(List<JSONObject> groups, List<String> groupingColumns) {
    groups.forEach(group -> {
      val keySet = group.keySet();
      val subtotalKeys = keySet
        .stream()
        .filter(key -> key.startsWith(SUBTOTAL_PREFIX))
        .collect(Collectors.toList());

      keySet.removeIf(key -> {
        val groupingColumnIndex = groupingColumns.indexOf(key);
        return (groupingColumnIndex != -1 && groupingColumnIndex != group.getInt(LEVEL_COLUMN_NAME) - 1);
      });
      keySet.removeIf(key -> key.startsWith(COMMON_PREFIX)
        && !subtotalKeys.contains(key)
        && !groupResponseIncludedColumns.contains(key));

      if (!subtotalKeys.isEmpty()) {
        val subtotalJsonObject = new JSONObject(subtotalKeys.size());

        subtotalKeys.forEach(key -> subtotalJsonObject.put(key.substring(SUBTOTAL_PREFIX.length()), group.get(key)));

        keySet.removeAll(subtotalKeys);

        group.put(SUBTOTALS_FIELD_NAME, subtotalJsonObject);
      }
    });
  }

  private void formatDataQueryResult(Collection<Column> columns, List<JSONObject> rows) {
    val columnsWithRender = columns
      .stream()
      .filter(column -> column.getRenderColumn() != null)
      .collect(Collectors.toList());

    rows.forEach(row ->
      columnsWithRender.forEach(column -> {
        val renderColumn = column.getRenderColumn();
        val rowNameColumnName = renderColumn.getName();

        row.put(
          String.format(
            "%s_by_%s",
            renderColumn.getFrom().getTableInfo().getTableName(),
            column.getColumnName()
          ),
          new JSONObject(
            Collections.singletonMap(
              renderColumn.getColumnInfo().getColumnName(),
              row.opt(rowNameColumnName)
            )
          )
        );

        row.remove(rowNameColumnName);
      }));
  }

  private <T> List<T> formatCollectionColumnNames(
    Collection<T> collection,
    Map<String, Column> columnByColumnInfoName,
    Function<T, String> columnNameGetter,
    BiFunction<T, String, T> newElementCreator) {
    return collection
      .stream()
      .map(element -> {
        val columnName = columnNameGetter.apply(element);
        val column = columnByColumnInfoName.get(columnName);
        return newElementCreator.apply(
          element,
          column.getRenderColumn() != null
            ? column.getRenderColumn().getName()
            : column.getColumnName());
      }).collect(Collectors.toList());
  }

  private List<Filtering> extractAllFilters(UserState userState) {
    val result = new ArrayList<Filtering>();
    if (userState.getGlobalFilters() != null) {
      result.addAll(userState.getGlobalFilters());
    }
    if (userState.getFilters() != null) {
      result.addAll(userState.getFilters());
    }
    return result;
  }

  // Костыль
  private List<ExpandedGroup> formatExpandedGroups(
    List<Grouping> groupings,
    List<ExpandedGroup> expandedGroups,
    Map<String, Column> columnByColumnInfoName) {
    return expandedGroups
      .stream()
      .map(expandedGroup -> {
        val elementIndex = new AtomicInteger();

        return ExpandedGroup
          .builder()
          .group(expandedGroup.getGroup()
            .stream()
            .map(element -> {
              val column = columnByColumnInfoName.get(groupings.get(elementIndex.getAndIncrement()).getColumnName());

              if (column != null && column.getColumnInfo().getColumnType().endsWith("[]")) {
                return Arrays
                  .stream(element.split(","))
                  .map(str -> String.format("\"%s\"", str))
                  .collect(Collectors.joining(",", "{", "}"));
              }

              return element;
            })
            .collect(Collectors.toList()))
          .build();
      })
      .collect(Collectors.toList());
  }

}
