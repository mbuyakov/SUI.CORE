package ru.sui.suibackend.cache

import com.google.common.cache.CacheBuilder
import org.springframework.stereotype.Component
import ru.sui.suibackend.model.UserState
import java.util.concurrent.TimeUnit

@Component
class UserStateCache {

    private val userStateCache = CacheBuilder.newBuilder().expireAfterWrite(3, TimeUnit.HOURS).build<String, UserState>()

    fun get(sessionId: String): UserState? {
        return userStateCache.getIfPresent(sessionId)
    }

    fun put(sessionId: String, userState: UserState) {
        userStateCache.put(sessionId, userState)
    }

    fun invalidate(sessionId: String) {
        userStateCache.invalidate(sessionId)
    }

}
