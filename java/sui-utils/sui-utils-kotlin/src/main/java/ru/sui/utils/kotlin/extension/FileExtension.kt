package ru.sui.utils.kotlin.extension

import java.io.File
import java.io.FileInputStream

import java.security.MessageDigest


fun File.getSha1(): ByteArray {
    val digest = MessageDigest.getInstance("SHA-1")
    val fis = FileInputStream(this)
    var n = 0
    val buffer = ByteArray(8192)
    while (n != -1) {
        n = fis.read(buffer)
        if (n > 0) {
            digest.update(buffer, 0, n)
        }
    }
    return digest.digest()
}
