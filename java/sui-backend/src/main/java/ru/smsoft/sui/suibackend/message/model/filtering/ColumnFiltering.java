package ru.smsoft.sui.suibackend.message.model.filtering;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringType;

@Data
@EqualsAndHashCode(callSuper = true)
public class ColumnFiltering extends Filtering {

  private String columnName;

  private FilteringOperation operation;

  private boolean raw;

  ColumnFiltering() {
    super(FilteringType.COLUMN);
  }

  ColumnFiltering(String columnName, FilteringOperation operation, boolean raw) {
    this();
    this.columnName = columnName;
    this.operation = operation;
    this.raw = raw;
  }
}
