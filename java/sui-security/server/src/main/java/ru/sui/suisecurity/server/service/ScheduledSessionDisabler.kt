package ru.sui.suisecurity.server.service

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import ru.sui.suisecurity.base.session.SessionManager


@Service
class ScheduledSessionDisabler(private val sessionManager: SessionManager) {

    @Scheduled(fixedDelayString = "\${security.session.disable-period:60000}")
    fun disableNotValidSessions() = sessionManager.disableNotValidSessions()

}
