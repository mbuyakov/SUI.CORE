package ru.sui.suientity.cache

import com.github.benmanes.caffeine.cache.Caffeine
import java.time.Duration

class SuiCacheSetting {

    var expireAfterWrite: Duration? = null
    var maximumSize: Long? = null
    var maximumWeight: Long? = null
    var allowNullValues: Boolean = true

    internal fun <K, V> apply(caffeine: Caffeine<K, V>): Caffeine<K, V> {
        return caffeine
                .let { if (expireAfterWrite != null) it.expireAfterWrite(expireAfterWrite!!) else it }
                .let { if (maximumSize != null) it.maximumSize(maximumSize!!) else it }
                .let { if (maximumWeight != null) it.maximumWeight(maximumWeight!!) else it }
    }

}
