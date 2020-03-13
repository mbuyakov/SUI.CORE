package ru.smsoft.sui.suisecurity.redis

import org.springframework.data.annotation.Id
import org.springframework.data.redis.core.RedisHash
import java.util.*

@RedisHash("session")
class Session (
        @Id
        val id: UUID,
        val userId: Long,
        val expiryDate: Date
)