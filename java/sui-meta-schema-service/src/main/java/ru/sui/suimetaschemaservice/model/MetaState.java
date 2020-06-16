package ru.sui.suimetaschemaservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import ru.sui.suientity.entity.suimeta.ColumnInfo;
import ru.sui.suientity.entity.suimeta.ColumnInfoReference;
import ru.sui.suientity.entity.suimeta.TableInfo;

@Getter
@Setter
@AllArgsConstructor
@Builder(toBuilder = true)
public class MetaState {

    private MetaInfo<InformationSchemaTable, TableInfo> tableInfoMetaInfo;

    private MetaInfo<InformationSchemaColumn, ColumnInfo> columnInfoMetaInfo;

    private MetaInfo<PossibleReference, ColumnInfoReference> columnInfoReferenceMetaInfo;

}
