package ru.sui.suibackend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.google.common.cache.CacheBuilder
import org.apache.commons.compress.archivers.zip.Zip64Mode
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.Row
import org.apache.poi.ss.usermodel.Sheet
import org.apache.poi.ss.usermodel.WorkbookFactory
import org.apache.poi.xssf.streaming.SXSSFWorkbook
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.context.ApplicationContext
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.messaging.SubProtocolWebSocketHandler
import ru.sui.suibackend.cache.UserStateCache
import ru.sui.suibackend.model.UserState
import ru.sui.suibackend.service.BackendService
import ru.sui.suibackend.utils.Constants.BACKEND_ENDPOINT
import ru.sui.suibackend.utils.Constants.INIT_SESSION_ID_KEY
import java.io.File
import java.io.InputStream
import java.util.*
import java.util.concurrent.TimeUnit
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import javax.servlet.http.HttpServletResponse
import javax.validation.constraints.Max
import javax.validation.constraints.Min
import kotlin.reflect.KProperty1
import kotlin.reflect.full.declaredMemberProperties
import kotlin.reflect.jvm.isAccessible


private const val NO_CACHED_SESSION_ERROR_MESSAGE = "Please call /init method first"
private const val MAX_DB_FETCH_SIZE = 50_000L
private const val MAX_ROWS_PER_SHEET = 250_000

private fun ZipInputStream.toFileIterator(): Iterator<Pair<String, InputStream>> {
    val zipInputStream = this

    return iterator {
        while (true) {
            val entry = zipInputStream.nextEntry

            if (entry != null) {
                if (entry.isDirectory) {
                    continue
                } else if (entry.name.endsWith(".zip")) {
                    ZipInputStream(zipInputStream).toFileIterator().forEach { yield(it) }
                } else {
                    yield(entry.name to zipInputStream)
                }
            } else {
                break
            }
        }
    }
}

private fun Sheet.putRow(rowNumber: Int, row: Row) {
    val sheetRow = this.createRow(rowNumber)
    row.forEach { cell ->
        val sheetCell = sheetRow.createCell(cell.columnIndex, cell.cellType)

        sheetCell.cellStyle = cell.cellStyle

        when (cell.cellType) {
            CellType.NUMERIC -> sheetCell.setCellValue(cell.numericCellValue)
            CellType.STRING -> sheetCell.setCellValue(cell.stringCellValue)
            CellType.FORMULA -> sheetCell.cellFormula = cell.cellFormula
            CellType.BLANK -> sheetCell.setCellValue(cell.stringCellValue)
            CellType.BOOLEAN -> sheetCell.setCellValue(cell.booleanCellValue)
            CellType.ERROR -> sheetCell.setCellErrorValue(cell.errorCellValue)
            else -> error("Unsupported cell type: ${cell.cellType}")
        }
    }
}

@RestController
@RequestMapping("$BACKEND_ENDPOINT/export")
@CrossOrigin
class ExportController(
        private val objectMapper: ObjectMapper,
        private val backendService: BackendService,
        private val userStateCache: UserStateCache,
        private val applicationContext: ApplicationContext
) {

    private val exportInfoCache = CacheBuilder
            .newBuilder()
            .expireAfterWrite(12, TimeUnit.HOURS)
            .build<String, ExportInfo>()

    @PostMapping("/init")
    fun init(@RequestHeader(INIT_SESSION_ID_KEY) sessionId: String) {
        val userState = userStateCache.get(sessionId) ?: getUserStateFromWebSocketSession(sessionId)

        if (userState != null) {
            val userStateForExport = userState.copy().apply {
                this.offset = 0L
                this.groupings = emptyList()
                this.expandedGroups = emptyList()
            }

            exportInfoCache.put(sessionId, ExportInfo(userStateForExport))
        } else {
            error("Couldn't find session with id = $sessionId")
        }
    }

    @Suppress("UNCHECKED_CAST")
    private fun getUserStateFromWebSocketSession(sessionId: String): UserState? {
        val sessions = SubProtocolWebSocketHandler::class.declaredMemberProperties
                .first { it.name == "sessions" }
                .apply { this.isAccessible = true }
                .get(applicationContext.getBean(SubProtocolWebSocketHandler::class.java)) as Map<String, Any>

        return sessions
                .map { (id, sessionHolder) ->
                    val session = (sessionHolder)::class.declaredMemberProperties
                            .first { it.name == "session" }
                            .let { it as KProperty1<Any, WebSocketSession> }
                            .apply { this.isAccessible = true }
                            .get(sessionHolder)

                    val initSessionId = (session.attributes[INIT_SESSION_ID_KEY] as String?) ?: id

                    return@map initSessionId to session
                }
                .firstOrNull { it.first == sessionId }
                ?.second
                ?.attributes?.get("state") as UserState?
    }

    @GetMapping("/data")
    fun rawData(
            @RequestHeader(INIT_SESSION_ID_KEY) sessionId: String,
            @RequestParam("fileCount") @Min(1) fileCount: Int,
            @RequestParam("fileSize") @Min(1) @Max(MAX_DB_FETCH_SIZE) fileSize: Int,
            response: HttpServletResponse
    ) {
        val userState = exportInfoCache.getIfPresent(sessionId)?.userState ?: error(NO_CACHED_SESSION_ERROR_MESSAGE)

        response.contentType = MediaType.APPLICATION_JSON_VALUE

        ZipOutputStream(response.outputStream).use { zipOutputStream ->
            objectMapper.writer().writeValues(zipOutputStream).use { writer ->
                var partNumber = 1

                for (chunk in (1..fileCount).chunked((MAX_DB_FETCH_SIZE / fileSize).toInt())) {
                    userState.pageSize = (chunk.size * fileSize).toLong()

                    val pageData = backendService.getData(userState)

                    if (pageData.totalCount > userState.offset) {
                        pageData.data
                                .asSequence()
                                .chunked(fileSize)
                                .forEach {
                                    zipOutputStream.putNextEntry(ZipEntry("${partNumber++}.json"))
                                    writer.write(it)
                                    zipOutputStream.closeEntry()
                                }

                        userState.offset += userState.pageSize
                    }

                    if (pageData.totalCount <= userState.offset) {
                        break
                    }
                }
            }
        }
    }

    @PostMapping("/importParts")
    fun importParts(@RequestHeader(INIT_SESSION_ID_KEY) sessionId: String, file: MultipartFile) {
        val exportInfo = exportInfoCache.getIfPresent(sessionId)

        if (exportInfo != null) {
            ZipInputStream(file.inputStream).use { zipInputStream ->
                // Раскладывает файлы по отдельным zip для возможности закрытия воркбуков
                zipInputStream.toFileIterator().forEach { (_, inputStream) ->
                    val localFile = File("/tmp/backend-export/${UUID.randomUUID()}.zip").apply {
                        this.parentFile.mkdirs()
                        this.createNewFile()
                        this.deleteOnExit()
                    }

                    ZipOutputStream(localFile.outputStream()).use {
                        it.putNextEntry(ZipEntry("part.xlsx"))
                        inputStream.copyTo(it)
                        it.closeEntry()
                    }

                    exportInfo.parts.add(localFile)
                }
            }
        } else {
            error(NO_CACHED_SESSION_ERROR_MESSAGE)
        }
    }

    @GetMapping("/joinParts")
    fun joinParts(@RequestHeader(INIT_SESSION_ID_KEY) sessionId: String, response: HttpServletResponse) {
        val exportInfo = exportInfoCache.getIfPresent(sessionId)

        if (exportInfo != null) {
            try {
                val rowIterator = iterator {
                    exportInfo.parts.forEachIndexed { partIndex, part ->
                        ZipInputStream(part.inputStream()).use { zipInputStream ->
                            // Архив содержит только 1 xlsx (чтобы можно было закрыть воркбук)
                            if (zipInputStream.nextEntry != null) {
                                WorkbookFactory.create(zipInputStream).use { workbook ->
                                    workbook.sheetIterator()
                                            .asSequence()
                                            .flatMap { it.rowIterator().asSequence() }
                                            .let { if (partIndex != 0) it.drop(1) else it } // Skip header for 2+ files
                                            .forEach { yield(it) }

                                    zipInputStream.closeEntry()
                                }
                            }
                        }
                    }
                }

                response.contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

                SXSSFWorkbook(XSSFWorkbook()).use { workbook ->
                    workbook.setZip64Mode(Zip64Mode.Always)

                    if (rowIterator.hasNext()) {
                        val headerRow = rowIterator.next()

                        var sheet: Sheet? = null

                        rowIterator.asSequence().forEachIndexed { rowIndex, row ->
                            val sheetRowIndex = rowIndex % MAX_ROWS_PER_SHEET

                            if (sheetRowIndex == 0) {
                                sheet = workbook.createSheet((rowIndex / MAX_ROWS_PER_SHEET + 1).toString())
                                sheet!!.putRow(0, headerRow)
                            }

                            sheet!!.putRow(sheetRowIndex + 1, row)
                        }
                    }

                    ZipOutputStream(response.outputStream).use {
                        it.putNextEntry(ZipEntry("table.xlsx"))
                        workbook.write(it)
                        it.closeEntry()
                    }
                }
            } finally {
                exportInfo.parts.forEach { kotlin.runCatching { it.delete() } }
                exportInfoCache.invalidate(sessionId)
            }
        } else {
            error(NO_CACHED_SESSION_ERROR_MESSAGE)
        }
    }

}

private class ExportInfo(
        val userState: UserState,
        val parts: MutableList<File> = mutableListOf()
)
