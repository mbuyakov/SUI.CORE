package ru.sui.suisecurity.session.redis

import org.springframework.data.annotation.Id
import org.springframework.data.redis.connection.ReturnType
import org.springframework.data.redis.core.RedisHash
import org.springframework.data.redis.core.RedisKeyValueAdapter
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.core.convert.RedisConverter
import org.springframework.data.redis.core.convert.RedisData
import org.springframework.data.redis.core.convert.SimpleIndexedPropertyValue
import org.springframework.data.redis.core.index.Indexed
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import ru.sui.suisecurity.session.Session
import java.security.MessageDigest
import java.util.*


private val sha1Digest = MessageDigest.getInstance("SHA-1")

private fun RedisConverter.toBytes(source: Any?) = this.conversionService.convert(source, ByteArray::class.java)
private fun RedisConverter.toString(source: Any?) = this.conversionService.convert(source, String::class.java)

@RedisHash("session")
class RedisSession(
    @Id
    val id: UUID,
    @Indexed
    val userId: Long,
    val expiryDate: Date,
    @Indexed
    val remoteAddress: String?,
    val created: Date,
    val lastUserActivity: Date,
    @Indexed
    val active: Boolean,
    val disablingDate: Date? = null
) {

    companion object {
        fun fromSession(session: Session) = RedisSession(
            id = session.id,
            userId = session.userId,
            expiryDate = session.expiryDate,
            remoteAddress = session.remoteAddress,
            created = session.created,
            lastUserActivity = session.lastUserActivity,
            active = session.active,
            disablingDate = session.disablingDate
        )
    }

    fun toSession() = Session(
        id = this.id,
        userId = this.userId,
        expiryDate = this.expiryDate,
        remoteAddress = this.remoteAddress,
        created = this.created,
        lastUserActivity = this.lastUserActivity,
        active = this.active,
        disablingDate = this.disablingDate
    )

}

@Repository
interface RedisSessionRepository : CrudRepository<RedisSession, UUID>, TransactionalSaveRedisSessionRepository {

    fun findAllByActiveIsTrue(): List<RedisSession>

    fun findAllByActiveIsTrueAndUserId(userId: Long): List<RedisSession>

}

interface TransactionalSaveRedisSessionRepository {

    @Transactional
    fun saveInTransaction(session: RedisSession): RedisSession

}


@Repository
@Suppress("SpringJavaInjectionPointsAutowiringInspection")
internal class TransactionalSaveRedisSessionRepositoryImpl(
        private val redisTemplate: RedisTemplate<Any, Any>,
        private val keyValueAdapter: RedisKeyValueAdapter
) : TransactionalSaveRedisSessionRepository {

    private val converter = keyValueAdapter.converter

    @Transactional
    override fun saveInTransaction(session: RedisSession): RedisSession {
        val redisData = RedisData().apply { converter.write(session, this) }

        redisTemplate.execute { connection ->
            val sessionKey = converter.toBytes(redisData.id!!)
            val fullSessionKey = keyValueAdapter.createKey(redisData.keyspace!!, redisData.id!!)

            connection.del(fullSessionKey)
            connection.hMSet(fullSessionKey, redisData.bucket.rawMap())
            connection.sAdd(converter.toBytes(redisData.keyspace!!), fullSessionKey)

            val sessionIndexKey = keyValueAdapter.createKey(converter.toString(fullSessionKey), "idx")

            // Remove old indexes
            // eval -> evalSha (skip isQueueing kostyl)
            val removeOldIndexesScript = """
                for i, key in ipairs(redis.call('SMEMBERS', KEYS[1])) do
                    redis.call('SREM', key, KEYS[2])
                end
            """.trimIndent()

            connection.evalSha<Any>(
                    sha1Digest.digest(converter.toBytes(removeOldIndexesScript)),
                    ReturnType.STATUS, // stub
                    2,
                    sessionIndexKey,
                    sessionKey
            )
            connection.del(sessionIndexKey)

            // Add new indexes
            redisData.indexedData.forEach {
                @Suppress("SENSELESS_COMPARISON")
                if ((it as SimpleIndexedPropertyValue).value != null) {
                    val indexKey = toIndexKey(it)
                    connection.sAdd(indexKey, sessionKey)
                    connection.sAdd(sessionIndexKey, indexKey)
                }
            }
        }

        return session
    }

    private fun toIndexKey(indexedData: SimpleIndexedPropertyValue): ByteArray {
        return keyValueAdapter.createKey(
            converter.toString(keyValueAdapter.createKey(indexedData.keyspace, indexedData.indexName)),
            converter.toString(converter.toBytes(indexedData.value))
        )
    }

}
