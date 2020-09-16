package ru.sui.utils.kotlin.extension

import java.util.*

fun <T : Any> Optional<T>.toNullable(): T? = this.orElse(null)

fun <T> Optional<T>.getOrNotFound(entity: String, search: String): T =
        this.orElseThrow { RuntimeException("Entity \"$entity\" not found ($search)") }

fun <T> Optional<T>.getOrNotFound(entity: String, vararg filters: Pair<String, Any?>): T =
        this.getOrNotFound(entity, filters.joinToString { "${it.first}=${it.second}" })
