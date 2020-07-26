package ru.sui.utils.kotlin.extension

fun String.framed(count: Int = 1): String {
    val lines = this.split('\n')
    val maxLineLength = lines.stream().mapToInt { it.length }.max().asInt
    val sb = StringBuilder()
    val topLine = "+${"-".repeat(maxLineLength + 2)}+"
    sb.append(topLine)
    sb.append(System.lineSeparator())
    lines.forEach {
        sb.append("| $it${" ".repeat(maxLineLength - it.length)} |${System.lineSeparator()}")
    }
    sb.append(topLine)
    val str = sb.toString()
    return if(count > 1) str.framed(count - 1) else str;
}
