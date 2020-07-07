package ru.sui.suibackend.service;

import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.sui.suibackend.model.query.*;
import ru.sui.suientity.entity.suimeta.ColumnInfo;
import ru.sui.suientity.entity.suimeta.TableInfo;
import ru.sui.suientity.entity.suisecurity.Role;
import ru.sui.suientity.entity.suisecurity.User;
import ru.sui.suientity.enums.RoleName;
import ru.sui.suientity.repository.suimeta.ColumnInfoRepository;
import ru.sui.suientity.repository.suimeta.SuiMetaSettingRepository;
import ru.sui.suientity.repository.suisecurity.RestrictionRepository;
import ru.sui.suisecurity.utils.MetaSchemaUtils;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

import static ru.sui.suibackend.utils.Constants.ALIAS_NAME_SUFFIX;

@RequiredArgsConstructor
@Service
public class MetaAccessService {

  private static final String FROM_SUB_QUERY_ALIAS = "____from_sub_query__alias";

  @NonNull
  private ru.sui.suisecurity.service.MetaSchemaService metaSchemaService;
  @NonNull
  private ColumnInfoRepository columnInfoRepository;
  @NonNull
  private SuiMetaSettingRepository suiMetaSettingRepository;
  @NonNull
  private RestrictionRepository restrictionRepository;

  @Getter
  @AllArgsConstructor
  @Builder
  public static class MetaData {

    private Table table;
    private Collection<Column> columns;
    private FromGraph fromGraph;
    private boolean emptyRestrictions;

  }

  @Transactional(readOnly = true)
  public MetaData getMetaData(Long tableInfoId, User user) {
    val tableInfo = metaSchemaService.getTableInfo(tableInfoId);

    if (tableInfo == null) {
      throw new IllegalArgumentException("TableInfo with id " + tableInfoId + " not found");
    }

    val fromTable = new Table(tableInfo);
    val columns = getColumns(fromTable, user.getRoles());

    return MetaData
      .builder()
      .table(fromTable)
      .columns(columns)
      .fromGraph(createFromGraph(fromTable, columns, user))
      .build();
  }

  private FromGraph createFromGraph(
    Table fromTable,
    Collection<Column> tableColumns,
    User user) {
    val renderFromGraph = createRenderFromGraph(fromTable, tableColumns);

    // ignore restrictions if user is Admin
    if (user.getRoles().stream().noneMatch(role -> role.getRoleName() == RoleName.ROLE_ADMIN)) {
      val restrictions = restrictionRepository.findRestrictions(user, Long.class);

      val joinedRestrictions = restrictions
        .stream()
        .map(Objects::toString)
        .map(restriction -> String.format("'%s'", restriction))
        .collect(Collectors.joining(","));

      val restrictionTableInfo = suiMetaSettingRepository.getRestrictionTable().orElse(null);

      if (restrictionTableInfo != null) {
        val fromTableInfo = fromTable.getTableInfo();

        // Select from restriction table
        if (restrictionTableInfo.equals(fromTableInfo)) {
          if (!restrictions.isEmpty()) {
            val fromSubQuery = FromSubQuery
              .builder()
              .alias(FROM_SUB_QUERY_ALIAS)
              .query(String.format("SELECT unnest(ARRAY[%s]) AS id", joinedRestrictions))
              .build();

            renderFromGraph.addJoin(
              JoinType.INNER_JOIN,
              fromSubQuery,
              ReferenceCondition
                .builder()
                .fromTable(fromTable)
                .toTable(fromSubQuery)
                .referencedColumnName("id")
                .build());
          } else {
            return null;
          }
        } else {
          val tableSegmentMap = new HashMap<TableInfo, TableSegment>();

          renderFromGraph
            .tableSegments()
            .stream()
            .filter(tableSegment -> tableSegment instanceof Table)
            .map(tableSegment -> (Table) tableSegment)
            .forEach(table -> tableSegmentMap.putIfAbsent(table.getTableInfo(), table));

          TableInfo currentTableInfo = fromTableInfo;
          Join lastExistingJoin = null;

          while (!restrictionTableInfo.equals(currentTableInfo)) {
            //noinspection ConstantConditions
            val followColumnInfo = currentTableInfo.getFollowColumnInfo();

            if (followColumnInfo != null) {
              val followTableInfo = MetaSchemaUtils.getReferencedTableInfo(followColumnInfo);

              val currentTable = tableSegmentMap.get(currentTableInfo);
              val followTable = tableSegmentMap.get(followTableInfo);

              if (currentTable != null && followTable != null) {
                val join = renderFromGraph.getJoin(currentTable, followTable);

                if (join != null) {
                  lastExistingJoin = join;
                }
              }

              currentTableInfo = followTableInfo;
            } else {
              break;
            }
          }

          if (restrictionTableInfo.equals(currentTableInfo)) {
            if (!restrictions.isEmpty()) {
              if (lastExistingJoin != null) {
                lastExistingJoin.setJoinType(JoinType.INNER_JOIN);
                lastExistingJoin.setJoinSegment(FromSubQuery
                  .builder()
                  .alias(lastExistingJoin.getJoinSegment().getAlias())
                  .query(generateRestrictionSubSelect(
                    ((Table) lastExistingJoin.getJoinSegment()).getTableInfo(),
                    restrictionTableInfo,
                    joinedRestrictions))
                  .build());
              } else {
                val followColumnInfo = fromTableInfo.getFollowColumnInfo();
                val subSelect = FromSubQuery
                  .builder()
                  .alias(FROM_SUB_QUERY_ALIAS)
                  .query(generateRestrictionSubSelect(
                    MetaSchemaUtils.getReferencedTableInfo(followColumnInfo),
                    restrictionTableInfo,
                    joinedRestrictions))
                  .build();

                renderFromGraph.addJoin(
                  JoinType.INNER_JOIN,
                  subSelect,
                  ReferenceCondition
                    .builder()
                    .fromTable(fromTable)
                    .toTable(subSelect)
                    .referencedColumnName(followColumnInfo.getColumnName())
                    .build());
              }
            } else {
              return null;
            }
          }
        }
      }
    }

    return renderFromGraph;
  }

  private FromGraph createRenderFromGraph(Table fromTable, Collection<Column> tableColumns) {
    val result = new FromGraph(fromTable);
    val joinIndex = new AtomicInteger();

    tableColumns
      .stream()
      .filter(Column::isVisible)
      .filter(column -> column.getRenderColumn() != null)
      .forEach(column -> {
        val renderColumn = column.getRenderColumn();
        val renderTable = renderColumn.getFrom();
        val renderTableInfo = renderTable.getTableInfo();

        var currentColumn = column;

        do {
          val referencedTableInfo = MetaSchemaUtils.getReferencedTableInfo(currentColumn.getColumnInfo());
          Table toTable;

          if (renderTableInfo.equals(referencedTableInfo)) {
            toTable = renderTable;
          } else {
            toTable = Table
              .builder()
              .tableInfo(referencedTableInfo)
              .alias("n" + joinIndex.incrementAndGet())
              .build();
          }

          result.addJoin(
            JoinType.LEFT_JOIN,
            toTable,
            ReferenceCondition
              .builder()
              .fromTable(currentColumn.getFrom())
              .toTable(toTable)
              .referencedColumnName(currentColumn.getColumnName())
              .build());

          //noinspection ConstantConditions
          currentColumn = Column
            .builder()
            .from(toTable)
            .columnInfo(referencedTableInfo.getForeignLinkColumnInfo())
            .build();
        } while (!renderColumn.equals(currentColumn));
      });

    return result;
  }

  private Collection<Column> getColumns(Table fromTable, Set<Role> roles) {
    val columns = new ArrayList<Column>();
    val aliasIndex = new AtomicInteger();

    fromTable.getTableInfo().getColumnInfos().forEach(columnInfo -> {
      Column renderColumn = null;
      val renderColumnInfo = MetaSchemaUtils.getReferenceRenderColumnInfo(columnInfo, roles);
      val isVisible = MetaSchemaUtils.isAllowedColumnInfo(columnInfo, roles);

      if (isVisible && renderColumnInfo != null) {
        val renderTableInfo = renderColumnInfo.getTableInfo();

        renderColumn = Column
          .builder()
          .from(new Table(renderTableInfo, "t" + aliasIndex.incrementAndGet()))
          .columnInfo(renderColumnInfo)
          .alias(columnInfo.getColumnName() + ALIAS_NAME_SUFFIX)
          .visible(true)
          .build();

        columns.add(renderColumn);
      }

      columns.add(Column
        .builder()
        .from(fromTable)
        .columnInfo(columnInfo)
        .renderColumn(renderColumn)
        .visible(isVisible)
        .build());
    });

    val renderColumns = columns
      .stream()
      .map(Column::getRenderColumn)
      .filter(Objects::nonNull)
      .collect(Collectors.toList());

    val fullSchemaReferenceRenderColumnInfoMap = columnInfoRepository
      .findWithRelationsByIdIn(
        renderColumns
          .stream()
          .map(Column::getColumnInfo)
          .map(ColumnInfo::getId)
          .distinct()
          .collect(Collectors.toList()))
      .stream()
      .collect(Collectors.toMap(ColumnInfo::getId, Function.identity()));

    // full initialize reference render column
    renderColumns.forEach(column -> {
      Long renderColumnInfoId = column.getColumnInfo().getId();

      column.setColumnInfo(
        Optional.ofNullable(fullSchemaReferenceRenderColumnInfoMap.get(renderColumnInfoId))
          .orElseThrow(() -> new RuntimeException(
            "Couldn't find columnInfo with id = " + renderColumnInfoId)));
    });

    return columns;
  }

  private String generateRestrictionSubSelect(
    TableInfo fromTableInfo,
    TableInfo restrictionTableInfo,
    String joinedRestrictions) {
    val fromTable = new Table(fromTableInfo);
    val fromGraph = new FromGraph(fromTable);

    Table previousTable = fromTable;

    while (!restrictionTableInfo.equals(previousTable.getTableInfo())) {
      val followColumnInfo = previousTable.getTableInfo().getFollowColumnInfo();
      val currentTable = new Table(MetaSchemaUtils.getReferencedTableInfo(followColumnInfo));

      fromGraph.addJoin(
        JoinType.INNER_JOIN,
        currentTable,
        new ReferenceCondition(previousTable, currentTable, followColumnInfo.getColumnName()));

      previousTable = currentTable;
    }

    return String.format(
      "SELECT %s.* %s WHERE %s.id IN (%s)",
      fromTable,
      fromGraph,
      MetaSchemaUtils.getFullTableInfoName(restrictionTableInfo),
      joinedRestrictions);
  }

}
