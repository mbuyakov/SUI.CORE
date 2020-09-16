package ru.sui.utils.hbase.wrapper

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.apache.hadoop.hbase.CellUtil
import org.apache.hadoop.hbase.HConstants
import org.apache.hadoop.hbase.TableName
import org.apache.hadoop.hbase.client.ColumnFamilyDescriptor
import org.apache.hadoop.hbase.client.ColumnFamilyDescriptorBuilder
import org.apache.hadoop.hbase.client.Put
import org.apache.hadoop.hbase.client.Result
import org.apache.hadoop.hbase.util.Bytes
import ru.sui.utils.hbase.annotation.HBaseAutoVersioning
import ru.sui.utils.hbase.annotation.HBaseVersionCol
import ru.sui.utils.hbase.enums.VersioningMode
import ru.sui.utils.kotlin.extension.filterNotNullValues
import java.util.*
import javax.persistence.Id
import javax.persistence.Transient


private val OBJECT_MAPPER = ObjectMapper().registerKotlinModule()

class HBaseDto(
  val rowKey: ByteArray,
  val cols: Map<HBaseColDesc, ByteArray?>,
  val version: Long = HConstants.LATEST_TIMESTAMP
) {
    fun toPut(): Put {
        val put = Put(rowKey, version)
        cols.filterNotNullValues().forEach {
            put.addColumn(it.key.family, it.key.name, it.value)
        }
        return put
    }
}

fun HBaseDto.get(family: ColumnFamilyDescriptor, name: String) = this.cols[HBaseColDesc(family.name, Bytes.toBytes(name))]

fun Result.cols(vararg families: ColumnFamilyDescriptor) = families.flatMap { family -> this.getFamilyMap(family.name).keys.map { HBaseColDesc(family.name, it) } }

fun Result.getVersions() = rawCells().map { it.timestamp }.toSet()

fun Result.toDto(cols: Collection<HBaseColDesc>, version: Long) = HBaseDto(this.row, cols.map { it to getNearestVersion(it, version) }.toMap(), version)

fun Result.toLatestVersionDto(cols: Collection<HBaseColDesc>): HBaseDto? = getVersions().max()?.let { toDto(cols, it) }

fun Result.toDtos(cols: List<HBaseColDesc>) = getVersions().map { it to toDto(cols, it) }.toMap()

fun Result.getNearestVersion(col: HBaseColDesc, version: Long): ByteArray? {
    return rawCells()
            .filter {
                it.timestamp <= version
                        && CellUtil.cloneFamily(it) contentEquals col.family
                        && CellUtil.cloneQualifier(it) contentEquals col.name
            }
            .maxBy { it.timestamp }
            ?.let { CellUtil.cloneValue(it) }
}


open class HBaseEntityConverter<T : Any, ID : Any>(val clazz: Class<T>, tableName: String) {
    val tableName: TableName = TableName.valueOf(tableName)
    protected val fields = clazz.declaredFields.filter { !it.isAnnotationPresent(Transient::class.java) }.map { HBaseField(it) }

    protected val idField = fields.find { it.field.isAnnotationPresent(Id::class.java) } ?: throw IllegalStateException("Entity ${clazz.name} doesn't have field wih @javax.persistence.Id")
    protected val versioningField = fields.find { it.field.isAnnotationPresent(HBaseVersionCol::class.java) }
    protected val standardCols = fields.filter { it != idField && it != versioningField }

    protected val fieldsByColDesc = standardCols.map { it.col to it }.toMap()
    protected val columnFamilies = standardCols.groupBy { String(it.col.family) }.keys.map { ColumnFamilyDescriptorBuilder.of(it) }

    protected val versioning: VersioningMode

    init {
        versioning = when {
            versioningField != null -> VersioningMode.BY_COL
            clazz.isAnnotationPresent(HBaseAutoVersioning::class.java) -> VersioningMode.AUTO
            else -> VersioningMode.DISABLED
        }
        fields.forEach {
            it.field.isAccessible = true
        }
    }


    @Suppress("UNCHECKED_CAST")
    protected fun getId(entity: T): ID = idField.field.get(entity) as ID

    protected fun idToRowKey(id: ID): ByteArray {
        return id
                .let { idField.stringConverter.encode(id) }
//                .check({ !it.contains('\\') }, { "[TODO]Id converted to string can't have '\\'" })
                .let { it.replace(Regex("\\/"), "\\\\") }
                .let { Bytes.toBytes(it) }
    }

    fun rowKeyToId(rowKey: ByteArray): ID {
        return rowKeyToId(rowKey.let { Bytes.toString(it) })
    }

    @Suppress("UNCHECKED_CAST")
    fun rowKeyToId(rowKey: String): ID {
        return rowKey
                .replace(Regex("\\\\"), "/")
                .let { idField.stringConverter.decode(it) as ID }
    }

    fun entityToDto(entity: T): HBaseDto {
        val id = getId(entity)
        val rowKey = idToRowKey(id)
        @Suppress("UNCHECKED_CAST")
        val version = when (versioning) {
            VersioningMode.DISABLED -> HConstants.LATEST_TIMESTAMP
            VersioningMode.BY_COL -> versioningField!!.getAndConvert(entity, versioningField.longConverter)!!
            VersioningMode.AUTO -> Date().time
        }
        val cols = standardCols
                .map { it.col to it.getAndConvert<ByteArray>(entity) }
                .toMap()
        return HBaseDto(rowKey, cols, version)
    }

    fun dtoToEntity(dto: HBaseDto): T {
        val entity = OBJECT_MAPPER.treeToValue(OBJECT_MAPPER.createObjectNode(), clazz)

        idField.set(entity, rowKeyToId(dto.rowKey))
        versioningField?.convertAndSet(entity, dto.version, versioningField.longConverter)
        dto.cols
                .filterNotNullValues()
                .forEach {
                    fieldsByColDesc
                            .getValue(it.key)
                            .convertAndSet(entity, it.value)
                }

        return entity
    }

//    protected fun entityToRowKey(entity: T): ByteArray = idToRowKey(getId(entity))

    protected fun getDiff(pre: HBaseDto, post: HBaseDto): HBaseDto {
        check(pre.rowKey contentEquals post.rowKey) { "Pre and post entity has difference row key" }
        check(versioning != VersioningMode.AUTO || pre.version == post.version) { "Pre and post entity has difference version" }

        val cols = standardCols
                .map {
                    val preValue = pre.cols[it.col]
                    val postValue = post.cols[it.col]

                    if (preValue != null && postValue == null) {
                        throw IllegalStateException("Can't remove value from column. Col=${it.col}, prev value=${it.byteArrayConverter.decode(preValue)}")
                    }
                    return@map if (postValue != null && preValue?.contentEquals(postValue) != true) it.col to postValue else null
                }
                .filterNotNull()
                .toMap()

        val version = when (versioning) {
            VersioningMode.AUTO -> Date().time
            VersioningMode.BY_COL -> post.version
            VersioningMode.DISABLED -> HConstants.LATEST_TIMESTAMP
        }

        return HBaseDto(pre.rowKey, cols, version)
    }

//    protected fun resultToFields(result: Result): Pair<ByteArray, Map<HBaseColDesc, ByteArray>>? = result.takeIf { it.rawCells().isNotEmpty() }?.let { _result -> _result.row to _result.noVersionMap.flatMap { family -> family.value.entries.map { HBaseColDesc(family.key, it.key) to it.value } }.toMap() }

//    protected fun entityToFields(entity: T): Pair<ByteArray, Map<HBaseColDesc, ByteArray?>> = entityToRowKey(entity) to fields.map { it.col to it.getAndConvert(entity) }.toMap()

//    protected fun entityToFieldsWithoutNulls(entity: T): Pair<ByteArray, Map<HBaseColDesc, ByteArray>> = entityToFields(entity).mapSecond { it.filterNotNullValues() }


//    protected fun fieldsToPut(pair: Pair<ByteArray, Map<HBaseColDesc, ByteArray>>): Put = fieldsToPut(pair.first, pair.second)

//    protected fun fieldsToPut(rowKey: ByteArray, fields: Map<HBaseColDesc, ByteArray>): Put {
//        val put = Put(rowKey)
//        if (versioning != VersioningMode.DISABLED) {
//            put.timestamp = if (versioning == VersioningMode.AUTO) Date().time else versioningCol!!.converter.decode(fields.getValue(versioningCol.col)) as Long
//        }
//        fields.forEach {
//            put.addColumn(it.key.family, it.key.name, it.value)
//        }
//        return put
//    }

//    protected fun fieldsToEntity(fields: Pair<ByteArray, Map<HBaseColDesc, ByteArray>>): T = clazz.newInstance().apply { idField.convertAndSet(this, fields.first); fields.second.forEach { fieldsByColDesc.getValue(it.key).convertAndSet(this, it.value) } }


//    protected fun resultToEntity(result: Result) = resultToFields(result)?.let { fieldsToEntity(it) }

//    protected fun entityToPut(entity: T) = fieldsToPut(entityToFieldsWithoutNulls(entity))
}
