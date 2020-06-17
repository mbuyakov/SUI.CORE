package ru.sui.suimetaschemaservice.model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Getter
@Setter
@EqualsAndHashCode(of = {"tableName", "tableSchema"}) // for future
public class InformationSchemaTable {

    private String tableName;

    private String tableSchema;

    private String tableType;

}
