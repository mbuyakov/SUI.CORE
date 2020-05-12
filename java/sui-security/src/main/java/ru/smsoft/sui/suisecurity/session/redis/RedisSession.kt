package ru.smsoft.sui.suisecurity.session.redis

import org.springframework.data.annotation.Id
import org.springframework.data.redis.core.RedisHash
import org.springframework.data.redis.core.index.Indexed
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import ru.smsoft.sui.suisecurity.session.Session
import ru.smsoft.sui.suisecurity.session.jpa.JpaSession
import java.util.*


@RedisHash("session")
class RedisSession(
    @Id
    val id: UUID,
    @Indexed
    val userId: Long,
    val expiryDate: Date,
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
            lastUserActivity = session.lastUserActivity,
            active = session.active,
            disablingDate = session.disablingDate
        )
    }

    fun toSession() = Session(
        id = this.id,
        userId = this.userId,
        expiryDate = this.expiryDate,
        lastUserActivity = this.lastUserActivity,
        active = this.active,
        disablingDate = this.disablingDate
    )

}

@Repository
interface RedisSessionRepository : CrudRepository<RedisSession, UUID> {

    fun findAllByActiveIsTrueAndUserId(userId: Long): List<JpaSession>

}
