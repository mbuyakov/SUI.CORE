package ru.sui.suisecurity.utils

import ru.sui.suientity.entity.suimeta.ColumnInfo
import ru.sui.suientity.entity.suimeta.TableInfo
import ru.sui.suientity.entity.suisecurity.Role
import ru.sui.suisecurity.exception.RecursiveRenderException
import java.util.*
import java.util.stream.Collectors

class MetaSchemaUtils {

    companion object {
        @JvmStatic
        fun getFullTableInfoName(tableInfo: TableInfo): String {
            return String.format("%s.%s", tableInfo.schemaName, tableInfo.tableName)
        }

        @JvmStatic
        fun getFullColumnInfoName(columnInfo: ColumnInfo): String {
            return String.format("%s.%s", getFullTableInfoName(columnInfo.tableInfo), columnInfo.columnName)
        }

        @JvmStatic
        fun getReferencedTableInfo(columnInfo: ColumnInfo): TableInfo? {
            return getReferencedColumnInfo(columnInfo)?.tableInfo
        }

        @JvmStatic
        fun getReferencedColumnInfo(columnInfo: ColumnInfo): ColumnInfo? {
            return columnInfo.references
                    ?.firstOrNull()
                    ?.foreignColumnInfo
        }

        @JvmStatic
        fun getColumnInfoByNameMap(columnInfos: Collection<ColumnInfo>): Map<String, ColumnInfo> {
            return columnInfos.stream()
                    .collect(Collectors.toMap({ it.columnName }, { it }))
        }

        @JvmStatic
        fun getReferencedForeignLinkColumnInfo(columnInfo: ColumnInfo?): ColumnInfo? {
            return columnInfo
                    ?.let { getReferencedTableInfo(it) }
                    ?.foreignLinkColumnInfo
        }

        @JvmStatic
        fun getReferenceRenderColumnInfo(columnInfo: ColumnInfo, roles: Set<Role>): ColumnInfo? {
            return getReferenceRenderColumnInfo(columnInfo, roles, HashSet())
        }

        @JvmStatic
        private fun getReferenceRenderColumnInfo(
                columnInfo: ColumnInfo,
                roles: Set<Role>,
                visitedTableInfos: MutableSet<TableInfo>
        ): ColumnInfo? {
            val referencedForeignLinkColumnInfo = getReferencedForeignLinkColumnInfo(columnInfo)

            if (referencedForeignLinkColumnInfo != null) {
                val foreignLinkTableInfo = referencedForeignLinkColumnInfo.tableInfo

                if (!visitedTableInfos.contains(foreignLinkTableInfo)) {
                    visitedTableInfos.add(foreignLinkTableInfo)
                } else {
                    throw RecursiveRenderException(foreignLinkTableInfo)
                }

                val forwardReferencedForeignLinkColumnInfo = getReferenceRenderColumnInfo(referencedForeignLinkColumnInfo, roles, visitedTableInfos)

                if (forwardReferencedForeignLinkColumnInfo != null) {
                    return forwardReferencedForeignLinkColumnInfo
                } else {
                    // отдельный if для красоты
                    if (isAllowedColumnInfo(referencedForeignLinkColumnInfo, roles) && referencedForeignLinkColumnInfo != MetaSchemaUtils.getIdColumnInfo(referencedForeignLinkColumnInfo.tableInfo)) {
                        return referencedForeignLinkColumnInfo
                    }
                }
            }

            return null
        }

        @JvmStatic
        private fun getIdColumnInfo(tableInfo: TableInfo): ColumnInfo? {
            return tableInfo.columnInfos.firstOrNull { it.columnName == "id" }
        }

        @JvmStatic
        fun getAllowedColumnInfos(tableInfo: TableInfo, userRoles: Set<Role>): Collection<ColumnInfo> {
            return tableInfo.columnInfos.filter { isAllowedColumnInfo(it, userRoles) }
        }

        @JvmStatic
        fun isAllowedColumnInfo(columnInfo: ColumnInfo, userRoles: Set<Role>): Boolean {
            return ("sui_meta".equals(columnInfo.tableInfo.schemaName, ignoreCase = true) // TODO: костыль?
                    || columnInfo.visible!! && columnInfo.roles.any { userRoles.contains(it) })
        }

        @JvmStatic
        fun findColumnByCamelCaseName(tableInfo: TableInfo, camelCaseName: String): ColumnInfo? {
            return tableInfo.columnInfos.firstOrNull { TextUtils.toCamelCase(it.columnName) == camelCaseName }
        }
    }
}
