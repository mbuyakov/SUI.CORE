package ru.sui.suibackend.message.model.filtering;

import lombok.AccessLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import ru.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class SimpleColumnFiltering extends ColumnFiltering {

  private String value;

  public SimpleColumnFiltering(String columnName, FilteringOperation operation, boolean raw, String value) {
    super(columnName, operation, raw);
    this.value = value;
  }
}
