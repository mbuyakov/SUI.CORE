package ru.sui.audit.manager.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.readValue
import org.apache.hadoop.hbase.client.Get
import org.apache.hadoop.hbase.client.Result
import org.apache.hadoop.hbase.client.Scan
import org.apache.hadoop.hbase.util.Bytes
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.sui.audit.common.*
import ru.sui.audit.common.extension.extractAuditTableInfoId
import ru.sui.audit.common.extension.nanos
import ru.sui.audit.common.extension.toHbaseTableName
import ru.sui.audit.common.extension.toSupportHbaseTableName
import ru.sui.audit.manager.extension.drop
import ru.sui.audit.manager.extension.recreate
import ru.sui.audit.manager.pojo.AuditLogDto
import ru.sui.audit.manager.utils.trigger.*
import ru.sui.suientity.entity.suimeta.TableInfo
import ru.sui.suientity.repository.suimeta.TableInfoRepository
import ru.sui.utils.hbase.service.HBaseClient
import ru.sui.utils.hbase.wrapper.HBaseDto
import ru.sui.utils.hbase.wrapper.cols
import ru.sui.utils.hbase.wrapper.get
import ru.sui.utils.hbase.wrapper.toLatestVersionDto
import java.util.*
import javax.persistence.EntityNotFoundException


private fun HBaseDto.get(name: String): ByteArray? = get(AUDIT_COLUMN_CF, name)?.takeIf { it.isNotEmpty() }
private fun HBaseDto.getAsString(name: String): String? = get(name)?.let { Bytes.toString(it) }
private fun HBaseDto.getAsLong(name: String): Long? = get(name)?.let { Bytes.toLong(it) }

@Service
class AuditService(
        private val tableInfoRepository: TableInfoRepository,
        private val jdbcTemplate: JdbcTemplate,
        private val hBaseClient: HBaseClient,
        private val objectMapper: ObjectMapper
) {

    private fun getTableInfo(tableInfoId: Long) = tableInfoRepository
            .findById(tableInfoId)
            .orElseThrow { EntityNotFoundException("TableInfo with id = $tableInfoId") }

    @Transactional
    fun startAuditTable(tableInfoId: Long) {
        val tableInfo = getTableInfo(tableInfoId)

        if (!tableInfo.isAudited) {
            if (tableInfo.schemaName === "log") {
                throw IllegalArgumentException("Невозможно вести аудит данной таблицы")
            }

            auditLogTrigger(tableInfo).recreate(jdbcTemplate)
            populateAuditColumnsTrigger(tableInfo).recreate(jdbcTemplate)
            tableInfoRepository.setIsAudited(tableInfo, true)
        }
    }

    @Transactional
    fun stopAuditTable(tableInfoId: Long) {
        val tableInfo = getTableInfo(tableInfoId)

        if (tableInfo.isAudited) {
            if (tableInfo.schemaName === "sui_meta") {
                throw IllegalArgumentException("Аудит метасхемы отключить нельзя")
            }

            auditLogTrigger(tableInfo).drop(jdbcTemplate)
            populateAuditColumnsTrigger(tableInfo).drop(jdbcTemplate)
            tableInfoRepository.setIsAudited(tableInfo, false)
        }
    }

    private fun auditLogTrigger(tableInfo: TableInfo): Trigger {
        return Trigger(
                name = "audit_log_trigger",
                triggerWhen = TriggerWhen.BEFORE,
                events = listOf(InsertTriggerEvent, UpdateTriggerEvent(), DeleteTriggerEvent),
                table = tableInfo,
                function = TriggerFunction("log", "audit_table_modification")
        )
    }

    private fun populateAuditColumnsTrigger(tableInfo: TableInfo): Trigger {
        return Trigger(
                name = "populate_audit_columns_trigger",
                triggerWhen = TriggerWhen.BEFORE,
                events = listOf(InsertTriggerEvent, UpdateTriggerEvent()),
                table = tableInfo,
                function = TriggerFunction("log", "populate_audit_columns")
        )
    }

    fun getTableInfoWithAuditLogs(): Iterable<Long> {
        return hBaseClient.admin.listTableNames().mapNotNull { it.extractAuditTableInfoId() }.toSet()
    }

    fun getLastModifiedRows(tableInfoId: Long, start: Date, end: Date, limit: Int = 1000): List<AuditLogDto> {
        val tableInfo = getTableInfo(tableInfoId)

        return hBaseClient
                .getTableIfExists(tableInfo.toHbaseTableName())
                ?.getScanner(Scan().apply {
                    this.setTimeRange(start.nanos(), end.nanos())
                    this.limit = limit
                    this.isReversed = true
                })
                ?.toList()
                ?.let { resultsToAuditLogDtos(it) }
                ?.sortedByDescending { it.created }
                ?: emptyList()
    }

    fun getAllLogsForRow(tableInfoId: Long, rowId: String): List<AuditLogDto> {
        val tableInfo = getTableInfo(tableInfoId)

        val logIgs = hBaseClient
                .getTableIfExists(tableInfo.toSupportHbaseTableName())
                ?.get(Get(Bytes.toBytes(rowId)))
                ?.value()
                ?.takeIf { it.isNotEmpty() }
                ?.let { objectMapper.readValue<Set<Long>>(it) }
                ?: emptySet()

        return hBaseClient
                .getTableIfExists(tableInfo.toHbaseTableName())
                ?.get(logIgs.map { Get(Bytes.toBytes(it)) })
                ?.toList()
                ?.let { resultsToAuditLogDtos(it) }
                ?.sortedByDescending { it.created }
                ?: emptyList()
    }

    private fun resultsToAuditLogDtos(results: List<Result>): List<AuditLogDto> {
        return results.map { result ->
            val dto = result.toLatestVersionDto(result.cols(AUDIT_COLUMN_CF))!!

            return@map AuditLogDto(
                    rowId = dto.getAsString(ROW_ID_KEY)!!,
                    operationType = dto.getAsString(OPERATION_TYPE_KEY)!!,
                    userId = dto.getAsLong(USER_ID_KEY),
                    dbUser = dto.getAsString(DB_USER_KEY)!!,
                    created = dto.getAsString(CREATED_KEY)!!,
                    content = objectMapper.readTree(dto.getAsString(CONTENT_KEY)!!) as ObjectNode
            )
        }
    }

}
