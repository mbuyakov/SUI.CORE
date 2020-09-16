package ru.sui.audit.common.extension

import org.apache.hadoop.hbase.TableName
import ru.sui.audit.common.AUDIT_TABLE_PREFIX


fun TableName.extractAuditTableInfoId(): Long? {
    return this.nameAsString
            ?.takeIf { it.startsWith(AUDIT_TABLE_PREFIX) }
            ?.substring(AUDIT_TABLE_PREFIX.length)
            ?.toLongOrNull()
}
