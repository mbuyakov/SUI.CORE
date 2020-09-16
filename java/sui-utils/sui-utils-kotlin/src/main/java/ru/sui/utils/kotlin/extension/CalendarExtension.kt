package ru.sui.utils.kotlin.extension

import java.text.SimpleDateFormat
import java.util.*

private val YYYY_MM_DD_FORMATTER = SimpleDateFormat("yyyy-MM-dd")

fun Calendar.toYMD(): String = YYYY_MM_DD_FORMATTER.format(this.time)
