package ru.smsoft.sui.suientity.repository.custom.suimeta;

import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;

import java.util.Optional;

public interface CustomTableInfoRepository {

    Optional<TableInfo> findByCamelCaseTableName(String camelCaseTableName);

}
