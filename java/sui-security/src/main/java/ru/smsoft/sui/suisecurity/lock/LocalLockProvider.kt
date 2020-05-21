package ru.smsoft.sui.suisecurity.lock

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.caffeine.CaffeineCache
import java.time.Duration
import java.util.concurrent.locks.Lock
import java.util.concurrent.locks.ReentrantLock

class LocalLockProvider : LockProvider {

    // Костыль (захардкожена реализация кеша)
    private val lockCache = CaffeineCache(
            "${this::class.qualifiedName}_lockCache",
            Caffeine.newBuilder().expireAfterAccess(Duration.ofMinutes(10)).build(),
            false
    )

    override fun get(group: String, key: String): Lock = lockCache.get(group to key) { ReentrantLock() }!!

}