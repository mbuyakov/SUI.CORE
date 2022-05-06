package ru.sui.audit.logmover.cron

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import mu.KotlinLogging
import org.apache.hadoop.hbase.HConstants
import org.apache.hadoop.hbase.TableName
import org.apache.hadoop.hbase.client.*
import org.apache.hadoop.hbase.util.Bytes
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import ru.sui.audit.common.*
import ru.sui.audit.common.extension.nanos
import ru.sui.audit.common.extension.toHbaseTableName
import ru.sui.audit.common.extension.toSupportHbaseTableName
import ru.sui.suientity.extension.template
import ru.sui.suientity.repository.log.AuditLogRepository
import ru.sui.utils.hbase.service.HBaseClient
import java.sql.Timestamp


private val log = KotlinLogging.logger { }

private const val BATCH_SIZE = 1000

private fun Put.addColumn(cf: ColumnFamilyDescriptor, name: String, value: ByteArray?) = this.addColumn(cf.name, Bytes.toBytes(name), value ?: byteArrayOf())

@Service
class MovingService(
    private val auditLogRepository: AuditLogRepository,
    private val hBaseClient: HBaseClient,
    private val objectMapper: ObjectMapper,
    transactionManager: PlatformTransactionManager
) {

    private val transactionTemplate = transactionManager.template()

    @Scheduled(fixedDelayString = "\${setting.logmover.delay:60000}")
    fun moveLogs() {
        log.info { "Start executing moveLogs()" }

        var logsToMoveCount = auditLogRepository.count()

        log.info { "Start processing $logsToMoveCount logs" }

        var batchIndex = 0

        while (logsToMoveCount > 0) {
            // Чтобы коммитать по BATCH_SIZE записей
            transactionTemplate.execute {
                val logsToMove = auditLogRepository
                        .findAll(PageRequest.of(0, BATCH_SIZE, Sort.by("id")))
                        .content

                log.info { "Start processing batch #${++batchIndex} (${logsToMove.size} elements)" }

                val putsPerTable = mutableListOf<Pair<Table, List<Put>>>()

                logsToMove
                        .groupBy { it.tableInfo }
                        .forEach { (tableInfo, logs) ->
                            // Main log table
                            val mainPuts = logs.map { log ->
                                Put(Bytes.toBytes(log.id), log.created.nanos())
                                        .addColumn(AUDIT_COLUMN_CF, ROW_ID_KEY, Bytes.toBytes(log.rowId))
                                        .addColumn(AUDIT_COLUMN_CF, OPERATION_TYPE_KEY, Bytes.toBytes(log.operationType.name))
                                        .addColumn(AUDIT_COLUMN_CF, USER_ID_KEY, log.user?.id?.let { Bytes.toBytes(it) })
                                        .addColumn(AUDIT_COLUMN_CF, DB_USER_KEY, Bytes.toBytes(log.dbUser))
                                        // Костыль с Timestamp
                                        .addColumn(AUDIT_COLUMN_CF, CREATED_KEY, Bytes.toBytes(Timestamp(log.created.time).toLocalDateTime().toString()))
                                        .addColumn(AUDIT_COLUMN_CF, CONTENT_KEY, objectMapper.writeValueAsBytes(log.content))
                            }

                            putsPerTable.add(getHbaseTable(tableInfo.toHbaseTableName()) to mainPuts)

                            // Support log table
                            val supportHbaseTable = getHbaseTable(tableInfo.toSupportHbaseTableName())

                            val logsByRowId = logs.groupBy { it.rowId }

                            val existingDataByRowId = supportHbaseTable
                                    .get(logsByRowId.keys.map { Get(Bytes.toBytes(it)) })
                                    .filter { it.value()?.isNotEmpty() ?: false }
                                    .map { Bytes.toString(it.row) to objectMapper.readValue<Set<Long>>(it.value()) }
                                    .toMap()

                            val supportPuts = logsByRowId.map { (rowId, rowLogs) ->
                                val value = existingDataByRowId[rowId] ?: emptySet()

                                return@map Put(Bytes.toBytes(rowId), HConstants.LATEST_TIMESTAMP)
                                        .addColumn(
                                                AUDIT_COLUMN_CF,
                                                SUPPORT_CONTENT_KEY,
                                                objectMapper.writeValueAsBytes(value.plus(rowLogs.map { it.id }))
                                        )
                            }

                            putsPerTable.add(supportHbaseTable to supportPuts)
                        }

                auditLogRepository.deleteAllInBatch(logsToMove)
                putsPerTable.parallelStream().forEach { (table, puts) -> table.put(puts) }

                logsToMoveCount -= logsToMove.size
            }
        }
    }

    private fun getHbaseTable(tableName: TableName): Table {
        if (!hBaseClient.admin.tableExists(tableName)) {
            hBaseClient.admin.createTable(
                    TableDescriptorBuilder
                            .newBuilder(tableName)
                            .setColumnFamily(AUDIT_COLUMN_CF)
                            .build()
            )
        }

        return hBaseClient.getTable(tableName)
    }

}
