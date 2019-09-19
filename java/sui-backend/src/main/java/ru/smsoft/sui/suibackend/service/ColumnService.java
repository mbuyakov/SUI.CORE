package ru.smsoft.sui.suibackend.service;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import lombok.var;
import org.springframework.stereotype.Service;
import ru.smsoft.sui.suibackend.model.Column;
import ru.smsoft.sui.suibackend.utils.Constants;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.entity.suisecurity.Role;
import ru.smsoft.sui.suientity.repository.suimeta.ColumnInfoRepository;
import ru.smsoft.sui.suisecurity.utils.MetaSchemaUtils;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ColumnService {

    @NonNull
    private ColumnInfoRepository columnInfoRepository;

    public Collection<Column> getColumns(TableInfo tableInfo, Set<Role> roles) {
        Collection<Column> columns = tableInfo.getColumnInfos()
                .stream()
                .map(columnInfo -> {
                    var referenceRenderColumnInfo =
                            MetaSchemaUtils.getReferenceRenderColumnInfo(columnInfo, roles);

                    return Column
                            .builder()
                            .columnInfo(columnInfo)
                            .renderColumnAlias((referenceRenderColumnInfo != null)
                                    ? columnInfo.getColumnName() + Constants.ALIAS_NAME_SUFFIX
                                    : null)
                            .renderColumnInfo(referenceRenderColumnInfo)
                            .visible(MetaSchemaUtils.isAllowedColumnInfo(columnInfo, roles))
                            .build();
                })
                .collect(Collectors.toList());

        val referenceRenderColumns = columns
                .stream()
                .filter(column -> column.getRenderColumnInfo() != null)
                .collect(Collectors.toList());

        val fullSchemaReferenceRenderColumnInfoMap = columnInfoRepository
                .findWithRelationsByIdIn(
                        referenceRenderColumns
                                .stream()
                                .map(Column::getRenderColumnInfo)
                                .map(ColumnInfo::getId)
                                .distinct()
                                .collect(Collectors.toList()))
                .stream()
                .collect(Collectors.toMap(
                        ColumnInfo::getId,
                        columnInfo -> columnInfo));

        // full initialize reference render column
        referenceRenderColumns.forEach(column -> {
            Long renderColumnInfoId = column.getRenderColumnInfo().getId();

            column.setRenderColumnInfo(
                    Optional.ofNullable(fullSchemaReferenceRenderColumnInfoMap.get(renderColumnInfoId))
                            .orElseThrow(() -> new RuntimeException(
                                    "Couldn't find columnInfo with id = " + renderColumnInfoId)));
        });

        return columns;
    }

}
