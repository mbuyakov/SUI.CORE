package ru.smsoft.sui.suibackend.message.model.filtering;

import lombok.AccessLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class IntervalColumnFiltering extends ColumnFiltering {

    private String[] value;

    public IntervalColumnFiltering(String columnName, boolean raw, String[] value) {
        super(columnName, FilteringOperation.INTERVAL, raw);
        this.value = value;
    }
}
