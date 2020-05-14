package ru.smsoft.sui.suisecurity.session

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import ru.smsoft.sui.suientity.entity.log.AuthenticationLog
import ru.smsoft.sui.suientity.enums.AuthenticationOperation
import ru.smsoft.sui.suientity.repository.log.AuthenticationLogRepository
import ru.smsoft.sui.suientity.repository.suisecurity.UserRepository
import ru.smsoft.sui.suisecurity.exception.SessionException
import ru.smsoft.sui.suisecurity.service.AuthenticationResultProvider
import ru.smsoft.sui.suisecurity.utils.SUCCESS_LOGOUT_TIMEOUT_RESULT_CODE
import java.util.*
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock


private const val HACK_PERIOD = 10000

private val TIMEOUT_DISABLE_LOCK = ReentrantLock()

private val log = KotlinLogging.logger {  }

@Service
// TODO: Надо как-то сихронизировать
class SessionManager(
        private val sessionService: SessionService,
        private val authenticationResultProvider: AuthenticationResultProvider,
        private val authenticationLogRepository: AuthenticationLogRepository,
        private val userRepository: UserRepository
) {

    @Value("\${security.session.enable-disabling-scheduler:false}")
    private val enableDisablingScheduler: Boolean = false
    @Value("\${security.session.allow-concurrent-sessions:false}")
    private val allowConcurrentSessions: Boolean = false
    @Value("\${security.session.timeout:1800000}") // Default 30m
    private val sessionTimeout: Long = 0

    fun createSession(session: Session) {
        synchronized(session.userId.toString().intern()) { // Костыль
            if (!allowConcurrentSessions) {
                val activeUserSessions = sessionService.findAllActiveByUserId(session.userId)

                if (activeUserSessions.isNotEmpty()) {
                  throw SessionException("Данный пользователь уже работает в системе. Для выполнения входа в систему необходимо выйти из системы на другом ПК (${activeUserSessions[0].remoteAddress})")
                }
            }

            sessionService.save(session)
        }
    }

    @Throws(SessionException::class)
    fun getSession(sessionId: UUID?) : Session {
        if (sessionId != null) {
            try {
                val session = sessionService.findById(sessionId)
                        ?: throw SessionException("Couldn't find session with id = $sessionId")

                if (!session.isValid(sessionTimeout)) {
                    if (session.active) {
                        timeoutDisableSession(session)
                    }

                    throw SessionException("Invalid session")
                } else {
                    session.lastUserActivity = Date()
                    sessionService.save(session)
                }

                return session
            } catch (exception: SessionException) {
                throw exception
            } catch (exception: Throwable) {
                throw SessionException("Unexpected error", exception)
            }
        } else {
            throw SessionException("sessionId is null")
        }
    }

    fun disableSession(session: Session) {
        session.disable()
        sessionService.save(session)
    }

    fun timeoutDisableSession(session: Session) {
        TIMEOUT_DISABLE_LOCK.withLock {
            disableSession(session)

            try {
                userRepository.findById(session.userId).ifPresent { user ->
                    // generate log
                    val log = authenticationLogRepository.save(AuthenticationLog().apply {
                        this.operation = AuthenticationOperation.LOGOUT
                        this.user = user
                        this.remoteAddress = session.remoteAddress
                        this.result = authenticationResultProvider.resultByCode(SUCCESS_LOGOUT_TIMEOUT_RESULT_CODE)
                        this.sessionId = sessionId
                    })

                    // Костыль, для уменьшения кол-ва логов
                    // Удаляем, если задублилось
                    val lastTwoUserLogs = authenticationLogRepository.findTop2ByUserOrderByCreatedDesc(user)

                    if (lastTwoUserLogs.size == 2
                            && lastTwoUserLogs[0].id == log.id
                            && lastTwoUserLogs.all { it.operation == AuthenticationOperation.LOGOUT }
                            && (lastTwoUserLogs[0].created.time - lastTwoUserLogs[1].created.time) <= HACK_PERIOD) {
                        authenticationLogRepository.delete(log)
                    }
                }
            } catch (exception: Exception) {
                log.error(exception) { "Couldn't create AuthenticationLog" }
            }
        }
    }

    @Scheduled(fixedDelayString = "\${security.session.disable-period:60000}")
    fun disableNotValidSessions() {
        if (enableDisablingScheduler) {
            sessionService
                    .findAllActive()
                    .filter { !it.isValid(sessionTimeout) }
                    .forEach { timeoutDisableSession(it) }
        }
    }



}
