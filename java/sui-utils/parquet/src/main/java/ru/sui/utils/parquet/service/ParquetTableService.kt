package ru.sui.utils.parquet.service

import mu.KotlinLogging
import org.apache.hadoop.fs.FileSystem
import org.apache.hadoop.fs.FileUtil
import org.apache.hadoop.fs.Path
import org.apache.parquet.example.data.Group
import org.apache.parquet.hadoop.ParquetFileWriter
import org.apache.parquet.hadoop.ParquetWriter
import org.apache.parquet.hadoop.example.GroupWriteSupport
import org.apache.parquet.hadoop.metadata.CompressionCodecName
import org.apache.parquet.schema.MessageType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationContext
import org.springframework.stereotype.Service
import ru.sui.utils.hdfs.extension.append
import ru.sui.utils.hdfs.extension.appendLeft
import ru.sui.utils.parquet.extension.append
import ru.sui.utils.parquet.utils.Directory
import ru.sui.utils.parquet.utils.DtoWrapper


val log = KotlinLogging.logger { }

const val TMP_FOLDER = "/parquet_tmp"
const val DATA_FILE_NAME = "data.snappy.parquet"

@Service
class ParquetTableService {

    @Autowired
    private lateinit var applicationContext: ApplicationContext

    private val instanceMap = HashMap<Class<*>, ParquetTableWrapper<*>>()

    @Suppress("UNCHECKED_CAST")
    fun <T : Any> getInstance(clazz: Class<T>, path: Path, directoryFields: List<String>? = null): ParquetTableWrapper<T> {
        return instanceMap.getOrPut(clazz) {
            ParquetTableWrapper(clazz, path, directoryFields).apply {
                applicationContext.autowireCapableBeanFactory.autowireBean(this)
            }
        } as ParquetTableWrapper<T>
    }

}

@Suppress("SpringJavaAutowiredMembersInspection")
class ParquetTableWrapper<T : Any>(
        private val clazz: Class<T>,
        private val path: Path,
        _directoryFields: List<String>? = null
) {

    @Autowired
    private lateinit var parquetReader: ParquetReader

    @Autowired
    private lateinit var fs: FileSystem

    private val directoryFields = _directoryFields
            ?.map { clazz.getDeclaredField(it) }
            ?: clazz.declaredFields
                    .toList()
                    .filter { it.isAnnotationPresent(Directory::class.java) }

    private val mapper = DtoWrapper(clazz, directoryFields.map { it.name })

    init {
        directoryFields.forEach { it.isAccessible = true }
    }

    fun read(directoryFields: List<Pair<String, Any>>): List<T> = parquetReader.readFolderToList(path.append(directoryFields), clazz)

    fun write(objects: List<T>): Map<Path, List<T>> {
        val objectsByDirectory = this.groupByFolder(objects)

        objectsByDirectory.keys
                .parallelStream()
                .forEach { check(!fs.exists(it)) { "Folder $it already exist. If you want override data - use ParquetTableWrapper.override()" } }

        objectsByDirectory.entries
                .parallelStream()
                .forEach {
                    val fullPath = it.key.append(DATA_FILE_NAME)
                    this.write(fullPath, it.value)
                }

        return objectsByDirectory
    }

    fun override(objects: List<T>): Map<Path, List<T>> {
        val objectsByDirectory = this.groupByFolder(objects)

        try {
            objectsByDirectory.entries
                    .parallelStream()
                    .forEach { this.write(it.key.appendLeft(TMP_FOLDER).append(DATA_FILE_NAME), it.value) }
        } catch (e: Exception) {
            log.error(e) { "Error while save parquet" }
            objectsByDirectory.entries
                    .parallelStream()
                    .forEach { fs.delete(it.key.appendLeft(TMP_FOLDER).append(DATA_FILE_NAME), false) }
            throw e
        }

        objectsByDirectory.entries
                .parallelStream()
                .forEach { check(FileUtil.copy(fs, it.key.appendLeft(TMP_FOLDER).append(DATA_FILE_NAME), fs, it.key.append(DATA_FILE_NAME), true,true, fs.conf)) { "Move failed" } }

        return objectsByDirectory
    }

    private fun write(path: Path, objects: List<T>) {
        log.info { "Write to $path" }
        @Suppress("DEPRECATION")
        val writer = ParquetWriter(
                path,
                ParquetFileWriter.Mode.OVERWRITE,
                GroupWriteSupport().hack(mapper.schema),
                CompressionCodecName.SNAPPY,
                ParquetWriter.DEFAULT_BLOCK_SIZE,
                ParquetWriter.DEFAULT_PAGE_SIZE,
                ParquetWriter.DEFAULT_PAGE_SIZE,
                ParquetWriter.DEFAULT_IS_DICTIONARY_ENABLED,
                ParquetWriter.DEFAULT_IS_VALIDATING_ENABLED,
                ParquetWriter.DEFAULT_WRITER_VERSION,
                fs.conf
        )
        objects.forEach { t -> log.info { writer.write(mapper.toGroup(t)) } }
        writer.close()
    }

    private fun <T> groupByFolder(objects: List<T>): Map<Path, List<T>> =
            objects.groupBy { path.append(directoryFields.map { f -> f.name to f.get(it).toString() }) }

}

fun GroupWriteSupport.hack(schema: MessageType): GroupWriteSupport {
    val schemaField = this::class.java.getDeclaredField("schema")
    schemaField.isAccessible = true
    schemaField.set(this, schema)
    return this
}
