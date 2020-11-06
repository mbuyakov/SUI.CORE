package ru.sui.suibackend.model.query;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Builder
public class ReferenceCondition implements Condition {

  private final TableSegment fromTable;
  private final String fromColumnName;
  private final TableSegment toTable;
  private final String toColumnName;

  @Override
  public String toString() {
    return String.format("%s.%s = %s.%s", fromTable, fromColumnName, toTable, toColumnName);
  }

}
