package ru.sui.suisecurity.base.session.jpa

import ru.sui.suisecurity.base.session.Session
import ru.sui.suisecurity.base.session.SessionService
import java.util.*


class JpaSessionService(
    private val jpaSessionRepository: JpaSessionRepository
) : SessionService {

    override fun findById(id: UUID) = jpaSessionRepository.findById(id).orElse(null)?.toSession()

    override fun save(session: Session) {
        jpaSessionRepository.save(JpaSession.fromSession(session))
    }

  override fun findAllActive() = jpaSessionRepository.findAllByActiveIsTrue().map { it.toSession() }

  override fun findAllActiveByUserId(userId: Long) = jpaSessionRepository.findAllByActiveIsTrueAndUserId(userId).map { it.toSession() }

}