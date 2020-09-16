package ru.sui.utils.parquet.service

import lombok.extern.slf4j.Slf4j
import org.apache.hadoop.fs.FileStatus
import org.apache.hadoop.fs.FileSystem
import org.apache.hadoop.fs.Path
import org.apache.parquet.example.data.Group
import org.apache.parquet.example.data.simple.convert.GroupRecordConverter
import org.apache.parquet.hadoop.ParquetFileReader
import org.apache.parquet.hadoop.util.HadoopInputFile
import org.apache.parquet.io.ColumnIOFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import ru.sui.utils.hdfs.extension.readFileOrFolderRecursive
import ru.sui.utils.parquet.utils.ParquetMapper
import java.util.*
import java.util.function.Predicate
import java.util.stream.Collectors
import java.util.stream.Stream


@Slf4j
@Component
class ParquetReader {

    @Autowired
    private lateinit var fs: FileSystem

    fun readAsGroupToStream(path: String): Stream<Pair<Path, Group>> = readAsGroupToStream(Path(path))

    fun readAsGroupToStream(path: Path): Stream<Pair<Path, Group>> = fs.readFileOrFolderRecursive(path)
            .filter { fileStatus: FileStatus -> fileStatus.path.toString().endsWith(".parquet") }
            .flatMap { fileStatus: FileStatus -> readFileAsGroupToStream(fileStatus) }

    fun readFileAsGroupToStream(fileStatus: FileStatus): Stream<Pair<Path, Group>> {
        require(fileStatus.isFile) { "readFileAsGroupToStream consume only File! If need read all folder - use readAsGroupToStream" }

        val groups = ArrayList<Pair<Path, Group>>()

        ParquetFileReader.open(HadoopInputFile.fromPath(fileStatus.path, fs.conf)).use { reader ->
            val schema = reader.footer.fileMetaData.schema
            var page = reader.readNextRowGroup()
            while (page != null) {
                val rows = page.rowCount
                val columnIO = ColumnIOFactory().getColumnIO(schema)
                val recordReader = columnIO.getRecordReader(page, GroupRecordConverter(schema))
                for (i in 0 until rows) {
                    groups.add(fileStatus.path to recordReader.read())
                }
                page = reader.readNextRowGroup()
            }
        }

        return groups.stream()
    }

    @JvmOverloads
    fun <T> readFolderToStream(path: String, genericClass: Class<T>, filter: Predicate<T>? = null) = readFolderToStream(Path(path), genericClass, filter)

    @JvmOverloads
    fun <T> readFolderToStream(path: Path, genericClass: Class<T>, filter: Predicate<T>? = null): Stream<T> {
        val mapper = ParquetMapper(genericClass, true)
        var stream = readAsGroupToStream(path).map { mapper.groupToObj(it.first, it.second) }

        if (filter != null) {
            stream = stream.filter(filter)
        }

        return stream
    }

    @JvmOverloads
    fun <T> readFoldersToStream(paths: Collection<String>, genericClass: Class<T>, filter: Predicate<T>? = null): Stream<T> = paths.stream().flatMap { path -> readFolderToStream(path, genericClass, filter) }

    @JvmOverloads
    fun <T> readFolderToList(path: String, genericClass: Class<T>, filter: Predicate<T>? = null): List<T> = readFolderToList(Path(path), genericClass, filter)
    @JvmOverloads
    fun <T> readFolderToList(path: Path, genericClass: Class<T>, filter: Predicate<T>? = null): List<T> = readFolderToStream(path, genericClass, filter).collect(Collectors.toList())

    @JvmOverloads
    fun <T> readFoldersToList(paths: Collection<String>, genericClass: Class<T>, filter: Predicate<T>? = null): List<T> = readFoldersToStream(paths, genericClass, filter).collect(Collectors.toList())

    fun isAnyExists(vararg paths: String) = Arrays
            .stream(paths)
            .anyMatch { path -> fs.readFileOrFolderRecursive(Path(path)).anyMatch { fileStatus: FileStatus -> fileStatus.path.toString().endsWith(".parquet") } }

}
