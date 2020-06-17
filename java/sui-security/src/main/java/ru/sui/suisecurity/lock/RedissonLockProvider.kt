package ru.sui.suisecurity.lock

import org.redisson.api.RedissonClient
import java.util.concurrent.locks.Lock

class RedissonLockProvider(private val redisson: RedissonClient): LockProvider {

    override fun get(group: String, key: String): Lock = redisson.getLock("$group|$key")

}
