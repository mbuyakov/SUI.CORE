package ru.sui.suisecurity.session

import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import ru.sui.suientity.enums.AuthenticationOperation
import ru.sui.suientity.enums.RoleName
import ru.sui.suientity.repository.suisecurity.UserRepository
import ru.sui.suisecurity.exception.SessionException
import ru.sui.suisecurity.lock.LockProvider
import ru.sui.suisecurity.service.AuthenticationLogService
import ru.sui.suisecurity.utils.CREATE_SESSION_LOCK_GROUP
import ru.sui.suisecurity.utils.SESSION_LOCK_GROUP
import ru.sui.suisecurity.utils.SUCCESS_LOGOUT_TIMEOUT_RESULT_CODE
import java.util.*
import kotlin.concurrent.withLock


private fun SessionService.getById(id: UUID) = this.findById(id) ?: error("Couldn't find session with id = $id")

@Service
class SessionManager(
        private val sessionService: SessionService,
        private val lockProvider: LockProvider,
        private val authenticationLogService: AuthenticationLogService,
        private val userRepository: UserRepository
) {

    @Value("\${security.session.enable-disabling-scheduler:false}")
    private val enableDisablingScheduler: Boolean = false
    @Value("\${security.session.allow-concurrent-sessions:false}")
    private val allowConcurrentSessions: Boolean = false
    @Value("\${security.session.timeout:1800000}") // Default 30m
    private val sessionTimeout: Long = 0

    fun createSession(session: Session) {
        lockProvider.get(CREATE_SESSION_LOCK_GROUP, session.userId.toString()).withLock {
            if (!allowConcurrentSessions) {
                val user = userRepository.findById(session.userId).get()

                // IF - Admin kostyl
                if (user.roles.none { it.roleName == RoleName.ROLE_ADMIN }) {
                    val activeUserSessions = sessionService.findAllActiveByUserId(session.userId)

                    if (activeUserSessions.isNotEmpty()) {
                        throw SessionException("Данный пользователь уже работает в системе. Для выполнения входа в систему необходимо выйти из системы на другом ПК (${activeUserSessions[0].remoteAddress})")
                    }
                }
            }

            sessionService.save(session)
        }
    }

    @Throws(SessionException::class)
    fun checkSession(sessionId: UUID, updateActivity: Boolean = true) {
        try {
            val session = sessionService.getById(sessionId)

            if (!session.isValid(sessionTimeout)) {
                disableBySessionId(sessionId, SUCCESS_LOGOUT_TIMEOUT_RESULT_CODE)

                throw SessionException("Invalid session")
            } else if (updateActivity) {
                lockSessionAndThenIfActive(sessionId) {
                    session.lastUserActivity = Date()
                    sessionService.save(session)
                }
            }
        } catch (exception: SessionException) {
            throw exception
        } catch (exception: Throwable) {
            throw SessionException("Unexpected error", exception)
        }
    }

    fun disableBySessionId(sessionId: UUID, resultCode: String? = null) {
        var wasDisabled = false

        var userId: Long? = null
        var remoteAddress: String? = null

        lockSessionAndThenIfActive(sessionId) { session ->
            session.disable()
            sessionService.save(session)

            wasDisabled = true
            userId = session.userId
            remoteAddress = session.remoteAddress
        }

        if (wasDisabled && resultCode != null) {
            authenticationLogService.create(
                    operation = AuthenticationOperation.LOGOUT,
                    resultCode = resultCode,
                    user = userRepository.findById(userId!!).get(),
                    remoteAddress = remoteAddress,
                    sessionId = sessionId
            )
        }
    }

    @Scheduled(fixedDelayString = "\${security.session.disable-period:60000}")
    fun disableNotValidSessions() {
        if (enableDisablingScheduler) {
            sessionService
                    .findAllActive()
                    .filter { !it.isValid(sessionTimeout) }
                    .forEach { disableBySessionId(it.id, SUCCESS_LOGOUT_TIMEOUT_RESULT_CODE) }
        }
    }

    private fun lockSessionAndThenIfActive(sessionId: UUID, action: (Session) -> Unit) {
        lockProvider.get(SESSION_LOCK_GROUP, sessionId.toString()).withLock {
            val session = sessionService.getById(sessionId)

            if (session.active) {
                action(session)
            }
        }
    }

}
