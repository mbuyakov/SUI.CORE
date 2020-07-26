package ru.sui.utils.hbase.repository

import org.apache.hadoop.hbase.TableName
import org.apache.hadoop.hbase.client.*
import org.apache.hadoop.hbase.util.Bytes
import org.springframework.beans.factory.annotation.Autowired
import ru.sui.utils.hbase.service.HBaseClient
import ru.sui.utils.hbase.wrapper.HBaseDto
import ru.sui.utils.hbase.wrapper.HBaseEntityConverter
import ru.sui.utils.hbase.wrapper.toLatestVersionDto


const val DEFAULT_COL_FAMILY = "cf"
const val ENTITY_CLASS_COL_FAMILY = "!!CLASS_:"

@Suppress("SpringJavaAutowiredMembersInspection")
open class HBaseTableRepository<T : Any, ID : Any>(clazz: Class<T>, tableName: String = clazz.simpleName) : HBaseEntityConverter<T, ID>(clazz, tableName) {

    private lateinit var hBaseClient: HBaseClient

    @Autowired
    fun setHBaseClient(hBaseClient: HBaseClient) {
        this.hBaseClient = hBaseClient
        postConstruct()
    }

    private lateinit var table: Table

    // Not work in abstract class
    // @PostConstruct
    private fun postConstruct() {
        if (!hBaseClient.admin.tableExists(tableName)) {
            val descr = TableDescriptorBuilder.newBuilder(tableName)
            descr.setColumnFamilies(columnFamilies)
            hBaseClient.admin.createTable(descr.build())
        }
        table = hBaseClient.getTable(tableName)
        val entityClassNameCF = Bytes.toBytes(ENTITY_CLASS_COL_FAMILY + clazz.name)
        if (table.descriptor.hasColumnFamily(entityClassNameCF)) {
            hBaseClient.admin.addColumnFamily(tableName, ColumnFamilyDescriptorBuilder.of(entityClassNameCF))
        }
    }

    private fun getResultById(id: ID): Result = table.get(Get(idToRowKey(id)))

    private fun getResultsByIds(ids: Iterable<ID>): List<Result> = table.get(ids.map { Get(idToRowKey(it)) }).toList()

    fun getById(id: ID) = findById(id) ?: error("Entity ${clazz.name} with $id not found")

    fun getAllById(ids: Iterable<ID>): List<T> {
        val idsList = ids.toList()
        return findAllById(ids).mapIndexed { i, t -> t ?: error("Entity ${clazz.name} with ${idsList[i]} not found") }
    }

    fun findAllById(ids: Iterable<ID>): List<T?> {
        return table
                .get(ids.map { Get(idToRowKey(it)) })
                .map { it.takeIf { result -> result.rawCells().isNotEmpty() } }
                .map { it?.toLatestVersionDto(standardCols.map { standardCol -> standardCol.col }) }
                .map { it?.let { dtoToEntity(it) } }
    }

    fun findById(id: ID): T? = getResultById(id).toLatestVersionDto(standardCols.map { it.col })?.let { dtoToEntity(it) }

    fun put(entity: T) = table.put(entityToDto(entity).toPut())

    fun putAll(entities: Iterable<T>) = table.put(entities.map { entityToDto(it).toPut() })

    fun dynamicUpdate(entity: T) {
        val id = getId(entity)
        val old = getResultById(id).toLatestVersionDto(standardCols.map { it.col })!!
        val changedFields = getDiff(old, entityToDto(entity))
        table.put(changedFields.toPut())
    }

    private fun mutateEntity(dto: HBaseDto, transform: (T) -> T) = getDiff(dto, entityToDto(transform(dtoToEntity(dto))))

    fun mutateEntityById(id: ID, transform: (T) -> T) = getResultById(id).toLatestVersionDto(standardCols.map { it.col })!!.let { fields -> mutateEntity(fields, transform).takeIf { it.cols.isNotEmpty() }?.let { table.put(it.toPut()) } }

    fun mutateAllEntitiesByIds(ids: Iterable<ID>, transform: (T) -> T) = table.put(getResultsByIds(ids).map { mutateEntity(it.toLatestVersionDto(standardCols.map { f -> f.col })!!, transform) }.filter { it.cols.isNotEmpty() }.map { it.toPut() })

}


fun getRepositoryByTableName(hBaseClient: HBaseClient, name: String): HBaseTableRepository<Any, Any> {
    val tableName = TableName.valueOf(name)
    val table = hBaseClient.getTable(tableName)
    val className = table.descriptor.columnFamilies.find { it.nameAsString.startsWith(ENTITY_CLASS_COL_FAMILY) }!!.nameAsString.replace(ENTITY_CLASS_COL_FAMILY, "")
    val clazz = Class.forName(className)

    @Suppress("UNCHECKED_CAST")
    val repository = HBaseTableRepository<Any, Any>(clazz as Class<Any>, name)
    repository.setHBaseClient(hBaseClient)
    return repository
}
