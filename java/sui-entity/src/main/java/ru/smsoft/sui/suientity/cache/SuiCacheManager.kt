package ru.smsoft.sui.suientity.cache

import com.github.benmanes.caffeine.cache.Caffeine
import org.springframework.cache.Cache
import org.springframework.cache.CacheManager
import org.springframework.cache.caffeine.CaffeineCache
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap


@Primary
@Component
class SuiCacheManager : CacheManager {

    private val cacheMap = ConcurrentHashMap<String, Cache>()

    override fun getCacheNames(): Collection<String> {
        return cacheMap.keys
    }

    override fun getCache(name: String): Cache? {
        return cacheMap[name]
    }

    fun registerCache(name: String, setting: SuiCacheSetting) {
        synchronized(name.intern()) {
            cacheMap[name] = CaffeineCache(
                name,
                Caffeine.newBuilder().let { setting.apply(it) }.build(),
                setting.allowNullValues
            )
        }
    }

}
