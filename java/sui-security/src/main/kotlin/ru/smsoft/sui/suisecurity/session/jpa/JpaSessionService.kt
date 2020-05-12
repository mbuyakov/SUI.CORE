package ru.smsoft.sui.suisecurity.session.jpa

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import ru.smsoft.sui.suisecurity.session.Session
import ru.smsoft.sui.suisecurity.session.SessionService
import java.util.*


@ConditionalOnMissingBean(SessionService::class)
class JpaSessionService(
    private val jpaSessionRepository: JpaSessionRepository
) : SessionService {

    override fun findById(id: UUID) = jpaSessionRepository.findById(id).orElse(null)?.toSession()

    override fun save(session: Session) {
        jpaSessionRepository.save(JpaSession.fromSession(session))
    }

  override fun findAllActiveByUserId(userId: Long) = jpaSessionRepository.findAllByActiveIsTrueAndUserId(userId).map { it.toSession() }

}
