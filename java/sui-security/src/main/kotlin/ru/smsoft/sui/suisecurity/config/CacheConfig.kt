package ru.smsoft.sui.suisecurity.config

import org.springframework.context.annotation.Configuration
import ru.smsoft.sui.suientity.cache.SuiCacheManager
import ru.smsoft.sui.suientity.cache.SuiCacheSetting
import ru.smsoft.sui.suisecurity.utils.VALIDATE_TOKEN_CACHE
import java.time.Duration
import javax.annotation.PostConstruct


@Configuration
class CacheConfig(
    private val suiCacheManager: SuiCacheManager
) {

    @PostConstruct
    private fun postConstruct() {
        suiCacheManager.registerCache(
            VALIDATE_TOKEN_CACHE,
            SuiCacheSetting().apply {
                this.expireAfterWrite = Duration.ofMillis(2500)
                this.allowNullValues = false
            }
        )
    }

}
