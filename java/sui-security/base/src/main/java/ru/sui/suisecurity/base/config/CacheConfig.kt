package ru.sui.suisecurity.base.config

import org.springframework.context.annotation.Configuration
import ru.sui.suientity.cache.SuiCacheManager
import ru.sui.suientity.cache.SuiCacheSetting
import ru.sui.suisecurity.base.utils.*
import java.time.Duration
import javax.annotation.PostConstruct


@Configuration("suiSecurityBaseCacheConfig")
class CacheConfig(private val suiCacheManager: SuiCacheManager) {

    @PostConstruct
    private fun postConstruct() {
        suiCacheManager.registerCache(
            VALIDATE_TOKEN_CACHE,
            SuiCacheSetting().apply {
                this.expireAfterWrite = Duration.ofMillis(VALIDATE_TOKEN_CACHE_TIMEOUT)
                this.allowNullValues = false
            }
        )
        suiCacheManager.registerCache(
            LOAD_USER_BY_ID_CACHE,
            SuiCacheSetting().apply {
                this.expireAfterWrite = Duration.ofMillis(15000)
                this.allowNullValues = false
            }
        )
        suiCacheManager.registerCache(
            LOAD_USER_BY_USERNAME_CACHE,
            SuiCacheSetting().apply {
                this.expireAfterWrite = Duration.ofMillis(15000)
                this.allowNullValues = false
            }
        )
        suiCacheManager.registerCache(
            TABLE_INFO_BY_CAMEL_CASE_NAME_CACHE,
            SuiCacheSetting().apply {
                this.expireAfterWrite = Duration.ofMillis(2500)
            }
        )
    }

}
