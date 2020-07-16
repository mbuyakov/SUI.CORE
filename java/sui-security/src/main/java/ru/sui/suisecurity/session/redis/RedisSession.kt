package ru.sui.suisecurity.session.redis

import org.redisson.client.codec.StringCodec
import org.redisson.client.protocol.RedisCommand
import org.redisson.spring.data.connection.RedissonConnection
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
import java.util.*


private fun RedisConverter.toBytes(source: Any?) = this.conversionService.convert(source, ByteArray::class.java)
private fun RedisConverter.toString(source: Any?) = this.conversionService.convert(source, String::class.java)

// eval isQueueing kostyl
@Suppress("SameParameterValue", "UNCHECKED_CAST")
private fun <T> Any.saveEval(
        script: ByteArray,
        returnType: ReturnType,
        numKeys: Int,
        vararg keysAndArgs: ByteArray
): T {
    val command = RedisCommand(org.redisson.api.RScript.ReturnType.STATUS.command, "EVAL")
    val params = mutableListOf<Any>().apply {
        this.add(script)
        this.add(numKeys)
        this.addAll(keysAndArgs)
    }
    val writeMethod = RedissonConnection::class.java.declaredMethods.first { it.name == "write" }
    writeMethod.isAccessible = true
    return writeMethod.invoke(this, null, StringCodec.INSTANCE, command, params.toTypedArray()) as T
}

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

        redisTemplate.execute{ connection ->
            val sessionKey = converter.toBytes(redisData.id)!!
            val fullSessionKey = keyValueAdapter.createKey(redisData.keyspace!!, redisData.id!!)

            connection.del(fullSessionKey)
            connection.hMSet(fullSessionKey, redisData.bucket.rawMap())
            connection.sAdd(converter.toBytes(redisData.keyspace!!), fullSessionKey)

            val sessionIndexKey = keyValueAdapter.createKey(converter.toString(fullSessionKey), "idx")

            // Remove old indexes
            val removeOldIndexesScript = """
                for i, key in ipairs(redis.call('SMEMBERS', KEYS[1])) do
                    redis.call('SREM', key, KEYS[2])
                end
            """.trimIndent()

            connection.saveEval<Any>(
                    converter.toBytes(removeOldIndexesScript),
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
