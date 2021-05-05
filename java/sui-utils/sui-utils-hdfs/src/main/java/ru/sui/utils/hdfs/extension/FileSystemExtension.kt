package ru.sui.utils.hdfs.extension

import mu.KotlinLogging
import org.apache.hadoop.fs.FileStatus
import org.apache.hadoop.fs.FileSystem
import org.apache.hadoop.fs.Path
import org.apache.hadoop.io.IOUtils
import java.io.FileNotFoundException
import java.io.IOException
import java.io.InputStream
import java.util.*
import java.util.stream.Stream


const val LOCK_POSTFIX = ".lock"

private val log = KotlinLogging.logger { }

fun FileSystem.saveHdfsFileToLocal(srcHdfsPath: String, dstLocalPath: String) {
    this.copyToLocalFile(Path(srcHdfsPath), Path(dstLocalPath))
}

fun FileSystem.saveLocalFileToHdfs(srcLocalPath: String, dstHdfsPath: String) {
    val dstPath = Path(dstHdfsPath)

    // Create or override
    try {
        this.exists(dstPath)
    } catch (exception: IOException) {
        this.create(dstPath)
    }

    this.copyFromLocalFile(Path(srcLocalPath), dstPath)
}

fun FileSystem.create(filePath: String, stream: InputStream, closeStream: Boolean = false) {
    this.create(Path(filePath), false).use { outFile -> IOUtils.copyBytes(stream, outFile, this.conf, closeStream) }
}

fun FileSystem.createWithLock(filePath: String, stream: InputStream, closeStream: Boolean = false) {
    try {
        val lockedFilePath = filePath + LOCK_POSTFIX

        // Create file with lock postfix
        this.create(lockedFilePath, stream, closeStream)

        // try to remove postfix (delete locked file on fail)
        try {
            this.unlock(lockedFilePath)
        } catch (exception: Exception) {
            kotlin.runCatching { this.delete(Path(lockedFilePath), false) }.onFailure { exception.addSuppressed(it) }
            throw exception
        }
    } finally {
        if (closeStream) {
            stream.close()
        }
    }
}

fun FileSystem.deleteWithException(filePath: String, recursive: Boolean = false) {
    check(this.delete(Path(filePath), recursive)) { "Couldn't delete $filePath" }
}

fun FileSystem.rename(srcFilePathStr: String, distFilePathStr: String) {
    val distFilePath = Path(distFilePathStr)

    if (!this.exists(distFilePath.parent)) {
        this.mkdirs(distFilePath.parent)
    }

    check(this.rename(Path(srcFilePathStr), distFilePath)) { "Couldn't rename $srcFilePathStr" }
}

fun FileSystem.lock(filePath: String): String {
    val lockedFilePath = "$filePath$LOCK_POSTFIX"
    this.rename(filePath, lockedFilePath)
    return lockedFilePath
}

fun FileSystem.unlock(filePath: String) {
    if (this.isLocked(filePath)) {
        this.rename(filePath, filePath.substring(0, filePath.length - LOCK_POSTFIX.length))
    } else {
        throw IllegalArgumentException("File $filePath is not locked")
    }
}

fun FileSystem.isLocked(filePath: String): Boolean = filePath.endsWith(LOCK_POSTFIX)

fun FileSystem.readFileOrFolder(path: Path): Stream<FileStatus> {
    val curFileStatus = try {
        this.getFileStatus(path)
    } catch (e: FileNotFoundException) {
        null
    }
    if (curFileStatus == null) {
        log.warn("Path {} not found. Aborted", path)

        return Stream.empty()
    }

    log.trace("Process {}", curFileStatus)

    return when {
        curFileStatus.isDirectory -> Arrays.stream(this.listStatus(path))
        curFileStatus.isFile -> Stream.of(curFileStatus)
        else -> throw IllegalStateException("Unknown FileStatus: $curFileStatus")
    }
}

fun FileSystem.readFileOrFolderRecursive(path: Path): Stream<FileStatus> {
    return readFileOrFolder(path).flatMap { fileStatus -> if (fileStatus.isDirectory) readFileOrFolderRecursive(fileStatus.path) else Stream.of(fileStatus) }
}
