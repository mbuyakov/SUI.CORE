package ru.smsoft.sui.suisecurity.session.redis

import ru.smsoft.sui.suisecurity.session.Session
import ru.smsoft.sui.suisecurity.session.SessionService
import java.util.*


class RedisSessionService(
    private val redisSessionRepository: RedisSessionRepository
) : SessionService {

    override fun findById(id: UUID) = redisSessionRepository.findById(id).orElse(null)?.toSession()

    override fun save(session: Session) {
        redisSessionRepository.save(RedisSession.fromSession(session))
    }

  override fun findAllActive() = redisSessionRepository.findAllByActiveIsTrue().map { it.toSession() }

  override fun findAllActiveByUserId(userId: Long) = redisSessionRepository.findAllByActiveIsTrueAndUserId(userId).map { it.toSession() }

}
