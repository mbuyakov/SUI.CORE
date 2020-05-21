package ru.smsoft.sui.suisecurity.service

import mu.KotlinLogging
import org.springframework.stereotype.Service
import ru.smsoft.sui.suientity.entity.log.AuthenticationLog
import ru.smsoft.sui.suientity.entity.log.AuthenticationResult
import ru.smsoft.sui.suientity.entity.suisecurity.User
import ru.smsoft.sui.suientity.enums.AuthenticationOperation
import ru.smsoft.sui.suientity.repository.log.AuthenticationLogRepository
import ru.smsoft.sui.suientity.repository.log.AuthenticationResultRepository
import ru.smsoft.sui.suisecurity.extension.get
import java.util.*


private val log = KotlinLogging.logger { }

@Service
class AuthenticationLogService(
        private val authenticationLogRepository: AuthenticationLogRepository,
        private val authenticationResultRepository: AuthenticationResultRepository
) {

    fun create(
            operation: AuthenticationOperation,
            resultCode: String,
            sessionId: UUID? = null,
            user: User? = null,
            remoteAddress: String? = null,
            clientInfo: String? = null,
            formLogin: String? = null
    ) = create(
            operation = operation,
            result = authenticationResultRepository.get(resultCode),
            sessionId = sessionId,
            user = user,
            remoteAddress = remoteAddress,
            clientInfo = clientInfo,
            formLogin = formLogin
    )

    fun create(
            operation: AuthenticationOperation,
            result: AuthenticationResult,
            sessionId: UUID? = null,
            user: User? = null,
            remoteAddress: String? = null,
            clientInfo: String? = null,
            formLogin: String? = null
    ) {
        try {
            authenticationLogRepository.save(AuthenticationLog().apply {
                this.operation = operation
                this.result = result
                this.sessionId = sessionId
                this.user = user
                this.remoteAddress = remoteAddress
                this.clientInfo = clientInfo
                this.formLogin = formLogin
            })
        } catch (exception: Exception) {
            log.error(exception) { "Couldn't create AuthenticationLog" }
        }
    }

}