package ru.smsoft.sui.suisecurity.session

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import ru.smsoft.sui.suisecurity.exception.SessionException
import java.util.*


@Service
class SessionManager(
    private val sessionService: SessionService
) {

    @Value("\${sessionTimeout:1800000}") // Default 30m
    private val sessionTimeout: Long = 0

    fun createSession(session: Session) {
        sessionService
            .findAllActiveByUserId(session.userId)
            .forEach {
                it.disable()
                sessionService.save(it)
            }

        sessionService.save(session)
    }

    @Throws(SessionException::class)
    fun getSession(sessionId: UUID?) {
        if (sessionId != null) {
            try {
                val session = sessionService.findById(sessionId)
                        ?: throw SessionException("Couldn't find session with id = $sessionId")

                if (!session.isValid(sessionTimeout)) {
                    if (session.active) {
                        session.disable()
                        sessionService.save(session)
                    }

                    throw SessionException("Invalid session")
                } else {
                    session.lastUserActivity = Date()
                    sessionService.save(session)
                }
            } catch (exception: SessionException) {
                throw exception
            } catch (exception: Throwable) {
                throw SessionException("Unexpected error", exception)
            }
        } else {
            throw SessionException("sessionId is null")
        }
    }

}
