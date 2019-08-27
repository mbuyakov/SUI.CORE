package ru.smsoft.sui.suisecurity.utils

import java.time.Duration
import java.time.Instant
import java.util.HashMap
import java.util.concurrent.CompletableFuture
import java.util.function.Supplier

class TimeCache<K, V>(private val cacheActualMillis: Long) {

    private val cache = HashMap<K, Pair<Instant, CompletableFuture<V?>>>()

    fun get(key: K, supplier: Supplier<V?>): V? {
        var cacheValue = cache[key]?.let {
            if (getMillisBetween(it.first, Instant.now()) <= cacheActualMillis) it.second else null
        }

        if (cacheValue == null) {
            cacheValue = CompletableFuture.supplyAsync(supplier)
            cache[key] = Pair(Instant.now(), cacheValue)
        }

        return cacheValue?.get()
    }

    private fun getMillisBetween(from: Instant, to: Instant): Long {
        return Duration.between(from, to).toMillis()
    }
}
