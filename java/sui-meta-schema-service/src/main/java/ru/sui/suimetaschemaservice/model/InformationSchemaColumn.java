package ru.sui.suimetaschemaservice.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Getter
@Setter
@EqualsAndHashCode(of = {"tableSchema", "tableName", "columnName"})
public class InformationSchemaColumn {

    private String tableSchema;

    private String tableName;

    private String columnName;

    private String columnType;

    private String columnDefault;

    private Boolean isNullable;

}
