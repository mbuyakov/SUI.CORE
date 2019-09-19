package ru.smsoft.sui.suibackend.service;

import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.smsoft.sui.suibackend.model.Column;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.entity.suisecurity.Role;

import java.util.Collection;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class MetaAccessService {

    @NonNull
    private ru.smsoft.sui.suisecurity.service.MetaSchemaService metaSchemaService;
    @NonNull
    private ColumnService columnService;

    @Getter
    @AllArgsConstructor
    public class MetaData {

        private TableInfo tableInfo;

        private Collection<Column> columns;

    }

    @Transactional
    public MetaData getMetaData(Long tableInfoId, Set<Role> roles) {
        val tableInfo = metaSchemaService.getTableInfo(tableInfoId);

        if (tableInfo == null) {
            throw new IllegalArgumentException("TableInfo with id " + tableInfoId + " not found");
        }

        return new MetaData(tableInfo, columnService.getColumns(tableInfo, roles));
    }

}
