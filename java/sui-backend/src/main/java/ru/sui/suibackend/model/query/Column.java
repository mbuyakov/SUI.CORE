package ru.sui.suibackend.model.query;

import lombok.*;
import ru.sui.suientity.entity.suimeta.ColumnInfo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(of = {"from", "columnInfo"})
public class Column {

  private Table from;
  private ColumnInfo columnInfo;
  private Column renderColumn;

  private String alias;
  private boolean visible;

  public String getName() {
    return alias != null ? alias : getColumnName();
  }

  public String getColumnName() {
    return columnInfo.getColumnName();
  }

  @Override
  public String toString() {
    return String.format("%s.%s", from, getName());
  }

}
