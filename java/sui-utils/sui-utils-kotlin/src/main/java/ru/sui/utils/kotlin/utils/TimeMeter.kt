package ru.sui.utils.kotlin.utils

import java.lang.StringBuilder
import java.util.concurrent.TimeUnit


class TimeMeter(private val title: String, private val logger: (String) -> Unit = ::println, autostart: Boolean = true) {
    private var startTime: Long? = null

    init {
        if(autostart) {
            start()
        }
    }

    fun start() {
        logger("Start $title")
        startTime = System.currentTimeMillis()
    }

    fun end() {
        val end = System.currentTimeMillis()
        logger("$title finished in ${formatMs(end - startTime!!)}")
    }
}

fun measureTime(title: String, logger: (String) -> Unit = ::println, block: () -> Unit) {
    val timeMeter = TimeMeter(title, logger)
    block()
    timeMeter.end()
}

fun formatMs(millis: Long): String {
    if(millis == 0L) {
        return "0ms"
    }
    val sb = StringBuilder()
    TimeUnit.MILLISECONDS.toDays(millis).takeIf { it > 0 }?.apply { sb.append("${this}d") }
    (TimeUnit.MILLISECONDS.toHours(millis) % 24).takeIf { it > 0 }?.apply { sb.append("${this}h") }
    (TimeUnit.MILLISECONDS.toMinutes(millis) % 60).takeIf { it > 0 }?.apply { sb.append("${this}m") }
    (TimeUnit.MILLISECONDS.toSeconds(millis) % 60).takeIf { it > 0 }?.apply { sb.append("${this}s") }
    (millis % 1000).takeIf { it > 0 }?.apply { sb.append("${this}ms") }
    return sb.toString()
}
