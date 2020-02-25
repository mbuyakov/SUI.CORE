package ru.smsoft.sui.suibackend.model.query;

import lombok.Getter;
import lombok.val;
import org.springframework.lang.NonNull;

import java.util.*;
import java.util.stream.Stream;

public class FromGraph {

  @Getter
  private final Table fromTable;
  private Map<TableSegment, List<Join>> joinMap;

  public FromGraph(Table fromTable) {
    this.fromTable = fromTable;
    joinMap = new HashMap<>();
  }

  public void addJoin(
    @NonNull JoinType joinType,
    @NonNull TableSegment toTableSegment,
    @NonNull ReferenceCondition condition) {
    val fromTable = Stream
      .of(condition.getFromTable(), condition.getToTable())
      .filter(table -> !toTableSegment.equals(table))
      .findFirst()
      .orElseThrow(() -> new IllegalArgumentException(
        String.format("Illegal join %s -> %1$s", toTableSegment)));

    if (!hasJoin(fromTable, toTableSegment)) {
      if (!joinMap.containsKey(fromTable)) {
        joinMap.put(fromTable, new ArrayList<>());
      }

      joinMap.get(fromTable).add(new Join(joinType, toTableSegment, condition));
    }
  }

  public Join getJoin(TableSegment fromTable, TableSegment toTable) {
    return Optional
      .ofNullable(joinMap.get(fromTable))
      .flatMap(joins -> joins
        .stream()
        .filter(join -> join.getJoinSegment().equals(toTable))
        .findFirst())
      .orElse(null);
  }

  public boolean hasJoin(TableSegment fromTable, TableSegment toTable) {
    return getJoin(fromTable, toTable) != null;
  }

  public Collection<TableSegment> tableSegments() {
    val tableSegments = new ArrayList<TableSegment>();

    tableSegments.add(fromTable);
    this.joinMap
      .values()
      .stream()
      .flatMap(Collection::stream)
      .map(Join::getJoinSegment)
      .forEach(tableSegments::add);

    return tableSegments;
  }

  @Override
  public String toString() {
    StringBuilder resultSB = new StringBuilder();

    resultSB.append("FROM ");
    resultSB.append(fromTable);
    appendJoins(fromTable, resultSB);

    return resultSB.toString();
  }

  private void appendJoins(TableSegment tableSegment, StringBuilder builder) {
    Optional.ofNullable(joinMap.get(tableSegment))
      .orElse(Collections.emptyList())
      .forEach(join -> {
        builder.append(' ');
        builder.append(join);
        appendJoins(join.getJoinSegment(), builder);
      });
  }

}
