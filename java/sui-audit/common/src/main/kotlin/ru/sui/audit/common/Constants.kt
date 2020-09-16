package ru.sui.audit.common

import org.apache.hadoop.hbase.client.ColumnFamilyDescriptor
import org.apache.hadoop.hbase.client.ColumnFamilyDescriptorBuilder
import org.apache.hadoop.hbase.util.Bytes


internal const val AUDIT_TABLE_PREFIX = "audit__"
internal const val SUPPORT_AUDIT_TABLE_PREFIX = "support_audit__"

const val ROW_ID_KEY = "row_id"
const val OPERATION_TYPE_KEY = "operation_type"
const val USER_ID_KEY = "user_id"
const val DB_USER_KEY = "db_user"
const val CREATED_KEY = "created"
const val CONTENT_KEY = "content"
const val SUPPORT_CONTENT_KEY = "content"

val AUDIT_COLUMN_CF: ColumnFamilyDescriptor = ColumnFamilyDescriptorBuilder.newBuilder(Bytes.toBytes("audit")).build()
