package ru.sui.suisecurity.session.redis

import org.springframework.data.annotation.Id
import org.springframework.data.redis.core.RedisHash
import org.springframework.data.redis.core.index.Indexed
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import ru.sui.suisecurity.session.Session
import java.util.*


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
interface RedisSessionRepository : CrudRepository<RedisSession, UUID> {

  @Transactional
  override fun <S : RedisSession?> save(entity: S): S

  fun findAllByActiveIsTrue(): List<RedisSession>

  fun findAllByActiveIsTrueAndUserId(userId: Long): List<RedisSession>

}
