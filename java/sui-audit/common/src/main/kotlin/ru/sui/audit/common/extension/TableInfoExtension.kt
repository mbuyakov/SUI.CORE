package ru.sui.audit.common.extension

import org.apache.hadoop.hbase.TableName
import ru.sui.audit.common.AUDIT_TABLE_PREFIX
import ru.sui.audit.common.SUPPORT_AUDIT_TABLE_PREFIX
import ru.sui.suientity.entity.suimeta.TableInfo


fun TableInfo.toHbaseTableName(): TableName = TableName.valueOf("$AUDIT_TABLE_PREFIX${this.id}")
fun TableInfo.toSupportHbaseTableName(): TableName = TableName.valueOf("$SUPPORT_AUDIT_TABLE_PREFIX${this.id}")