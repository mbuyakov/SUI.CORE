package ru.sui.suientity.repository.custom.suimeta;

import ru.sui.suientity.entity.suimeta.TableInfo;

import java.util.Optional;

public interface CustomTableInfoRepository {

    Optional<TableInfo> findByCamelCaseTableName(String camelCaseTableName);

}
