package ru.sui.utils.kotlin.extension

import kotlin.experimental.and

fun ByteArray.toHexString(): String {
    var result = ""
    for (i in this.indices) {
        result += ((this[i] and 0xff.toByte()) + 0x100).toString(16).substring(1)
    }
    return result
}
