package ru.sui.suimetaschemaservice.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Getter
@Setter
@EqualsAndHashCode(of = {
    "columnTableSchema", "columnTableName", "columnName",
    "foreignColumnTableSchema", "foreignColumnTableName", "foreignColumnName"
}) // for future
public class PossibleReference {

    private String columnTableSchema;

    private String columnTableName;

    private String columnName;

    private String foreignColumnTableSchema;

    private String foreignColumnTableName;

    private String foreignColumnName;

}
