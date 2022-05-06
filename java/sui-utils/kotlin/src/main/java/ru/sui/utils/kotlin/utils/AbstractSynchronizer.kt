package ru.sui.utils.kotlin.utils

import mu.KotlinLogging
import ru.sui.utils.kotlin.extension.framed
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread
import kotlin.concurrent.withLock


private val FLUSH_LOCK = ReentrantLock()
private val log = KotlinLogging.logger { }

enum class SynchronizerStatus {
    CREATED,
    STARTED,
    STOPPING,
    STOPPED,
    INTERRUPTED
}

@Suppress("FunctionName")
abstract class AbstractSynchronizer<K : Any, V : Any>(
        name: String,
        private val syncInterval: Long = 1000,
        private val isExceptionRetryable: (Exception) -> Boolean = { true }
) {

    private val threadName = "$name-synchronizer"
    private val changedMap = ConcurrentHashMap<K, V>()
    private var thread: Thread? = null

    @Volatile private var status: SynchronizerStatus = SynchronizerStatus.CREATED
        set(value) {
            log.info { "[$threadName] $field -> $value " }
            field = value
        }

    private fun start() {
        thread = thread(name = threadName) {
            while (true) {
                if (status == SynchronizerStatus.STOPPING) {
                    _flush(true)
                    break
                }
                _flush()
                try {
                    Thread.sleep(syncInterval)
                } catch (e: InterruptedException) {
                    // If daemon process trying to dead - flush actual data
                    log.debug { "$threadName InterruptedException. Call flush and throw" }
                    _flush(true)
                    status = SynchronizerStatus.INTERRUPTED
                    throw e
                }
            }
        }
        Runtime.getRuntime().addShutdownHook(object: Thread() {
            override fun run() {
                log.info { "[$threadName] JVM shutdown hook" }
                shutdown()
            }
        })
        status = SynchronizerStatus.STARTED
    }

    private fun _flush(repeat: Boolean = false) {
        FLUSH_LOCK.withLock { _flushThreadUnsafe(repeat) }
    }

    private fun _flushThreadUnsafe(repeat: Boolean) {
        var changedMapCopy: HashMap<K, V>

        synchronized(changedMap) {
            log.trace { "$threadName sync. ChangedMap locked" }
            changedMapCopy = HashMap(changedMap)
            changedMap.clear()
        }

        if (changedMapCopy.size > 0) {
            log.trace { "$threadName changed values: ${changedMapCopy.entries.joinToString { "${it.key} -> ${it.value}" }}" }
            try {
                flush(changedMapCopy)
            } catch (e: Exception) {
                log.error(e) {"Flush failed. Return changed value back to map"}
                changedMap.putAll(changedMapCopy)
                if (repeat) {
                    if (!isExceptionRetryable(e)) {
                        log.error(e) { "Exception mark as non-retryable. Throw" }
                        log.error { "Loosed messages:\n${changedMap.entries.joinToString("\n")}".framed(2) }
                        status = SynchronizerStatus.INTERRUPTED
                        throw e
                    }
                    _flush(repeat)
                }
            }
        }
    }

    protected abstract fun flush(changedData: Map<K, V>)

    fun flush() {
        checkStatus()
        FLUSH_LOCK.withLock {
            synchronized(changedMap) {
                _flushThreadUnsafe(true)
            }
        }
    }

    fun put(key: K, value: V) {
        checkStatus()
        synchronized(changedMap) {
            changedMap.put(key, value)
        }
    }

    // @Synchronized чтобы убрать возможность двойного start()
    @Synchronized private fun checkStatus() {
        when (status) {
            SynchronizerStatus.CREATED -> start()
            SynchronizerStatus.STOPPING, SynchronizerStatus.STOPPED, SynchronizerStatus.INTERRUPTED -> throw IllegalStateException("$threadName in $status stage")
            else -> {}
        }
    }

    fun shutdown() {
        if(status == SynchronizerStatus.STARTED) {
            status = SynchronizerStatus.STOPPING
            thread!!.join()
        }
        status = SynchronizerStatus.STOPPED
    }

}
