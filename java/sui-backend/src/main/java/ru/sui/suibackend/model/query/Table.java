package ru.sui.suibackend.model.query;

import lombok.*;
import ru.sui.suientity.entity.suimeta.TableInfo;
import ru.sui.suisecurity.utils.MetaSchemaUtils;

@Getter
@AllArgsConstructor
@EqualsAndHashCode
@Builder
public class Table implements TableSegment {

  private final TableInfo tableInfo;
  private final String alias;

  public Table(TableInfo tableInfo) {
    this(tableInfo, null);
  }

  @Override
  public @NonNull String getStatement() {
    return MetaSchemaUtils.getFullTableInfoName(this.tableInfo);
  }

  @Override
  public @NonNull String toString() {
    return this.alias != null ? alias : getStatement();
  }

}
