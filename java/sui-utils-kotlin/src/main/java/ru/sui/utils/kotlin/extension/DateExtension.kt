package ru.sui.utils.kotlin.extension

import java.text.SimpleDateFormat
import java.util.*

private val DEFAULT_DATE_FORMAT = SimpleDateFormat("yyyy-MM-dd")

fun Date.toDateString(format: SimpleDateFormat = DEFAULT_DATE_FORMAT): String = format.format(this)
