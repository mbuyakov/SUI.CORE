package ru.sui.suisecurity.base.service

import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import ru.sui.suientity.entity.suimeta.TableInfo
import ru.sui.suientity.repository.suimeta.TableInfoRepository
import ru.sui.suisecurity.base.utils.TABLE_INFO_BY_CAMEL_CASE_NAME_CACHE


@Service
class MetaSchemaService(private val tableInfoRepository: TableInfoRepository) {

    fun getTableInfo(id: Long): TableInfo? {
        return tableInfoRepository
                .findByIdWithColumnInfoAndRolesAndReferencesAndSubtotalTypesAndFilterTypes(id)
                .orElse(null)
    }

    @Cacheable(TABLE_INFO_BY_CAMEL_CASE_NAME_CACHE)
    fun getTableInfoByCamelCaseTableName(camelCaseTableName: String): TableInfo? {
        return tableInfoRepository
                .findByCamelCaseTableName(camelCaseTableName)
                .orElse(null)
    }

}
