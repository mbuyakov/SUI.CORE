package ru.sui.utils.kotlin.extension

import java.io.PrintWriter
import java.io.StringWriter

fun Throwable.stackTraceToString(): String {
    StringWriter().use {
        PrintWriter(it).use { pw -> printStackTrace(pw) }
        return it.toString()
    }
}

