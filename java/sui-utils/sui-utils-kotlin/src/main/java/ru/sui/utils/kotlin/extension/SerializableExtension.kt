package ru.sui.utils.kotlin.extension

import java.io.*

fun Serializable.serialize(): ByteArray {
    ByteArrayOutputStream().use { bos ->
        ObjectOutputStream(bos).use {
            it.writeObject(this)
            it.flush()
        }
        return bos.toByteArray()
    }
}

@Suppress("unused")
fun <T: Serializable> Class<T>.deserialize(bytes: ByteArray): T {
    ByteArrayInputStream(bytes).use { bis ->
        ObjectInputStream(bis).use {
            @Suppress("UNCHECKED_CAST")
            return it.readObject() as T
        }
    }
}
