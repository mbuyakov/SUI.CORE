package ru.smsoft.sui.suibackend.message.model.filtering;

import lombok.AccessLevel;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suibackend.message.model.filtering.enumeration.FilteringOperation;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
public class InColumnFiltering extends ColumnFiltering {

    private List<Object> elements;

    InColumnFiltering(String columnName, FilteringOperation operation, boolean raw, List<Object> elements) {
        super(columnName, operation, raw);
        this.elements = elements;
    }
}
