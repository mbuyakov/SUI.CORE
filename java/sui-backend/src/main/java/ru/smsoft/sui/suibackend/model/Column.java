package ru.smsoft.sui.suibackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class Column {

    private ColumnInfo renderColumnInfo;

    private String renderColumnAlias;

    private ColumnInfo columnInfo;

    private boolean visible;

}
