package ru.smsoft.sui.suisecurity.service

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service
import ru.smsoft.sui.suientity.enums.AuthenticationOperation
import ru.smsoft.sui.suientity.repository.log.AuthenticationLogRepository
import ru.smsoft.sui.suientity.repository.log.AuthenticationResultRepository
import ru.smsoft.sui.suientity.repository.suisecurity.UserRepository
import ru.smsoft.sui.suisecurity.exception.TooManyAttemptsException
import ru.smsoft.sui.suisecurity.extension.clientIp
import ru.smsoft.sui.suisecurity.extension.get
import ru.smsoft.sui.suisecurity.extension.jwtToken
import ru.smsoft.sui.suisecurity.model.LoginResult
import ru.smsoft.sui.suisecurity.security.JwtTokenProvider
import ru.smsoft.sui.suisecurity.security.UserPrincipal
import ru.smsoft.sui.suisecurity.session.SessionManager
import ru.smsoft.sui.suisecurity.utils.*
import java.util.*


private val log = KotlinLogging.logger {  }

@Service
@Suppress("ThrowableNotThrown", "UNCHECKED_CAST")
class AuthenticationService(
        private val authenticationManager: AuthenticationManager,
        private val tokenProvider: JwtTokenProvider,
        private val sessionManager: SessionManager,
        private val authenticationLogService: AuthenticationLogService,
        // repos
        private val authenticationResultRepository: AuthenticationResultRepository,
        private val authenticationLogRepository: AuthenticationLogRepository,
        private val userRepository: UserRepository
) {

    @Value(value = "\${security.login.max-attempts-count:25}")
    private var maxAttemptsCount: Long = 0L
    @Value(value = "\${security.login.max-attempts-period:3600000}") // Default 1h
    private var maxAttemptsPeriod: Long = 0L

    fun login(token: UsernamePasswordAuthenticationToken): LoginResult {
        var loginResultCode: String = SUCCESS_LOGIN_AUTH_RESULT_CODE
        var loginException: Exception? = null

        var formLogin: String? = null
        var remoteAddress: String? = null

        var principal: UserPrincipal? = null
        var jwt: String? = null

        try {
            try {
                formLogin = token.principal as String
                remoteAddress = getRequest().clientIp

                val attempts = authenticationLogRepository.countByOperationAndRemoteAddressAndFormLoginAndCreatedIsGreaterThanEqual(
                        AuthenticationOperation.LOGIN,
                        remoteAddress,
                        formLogin,
                        Date(Date().time - maxAttemptsPeriod)
                )

                if (attempts >= maxAttemptsCount) {
                    throw TooManyAttemptsException()
                }

                val authentication = authenticationManager.authenticate(token) as UsernamePasswordAuthenticationToken
                authentication.postAuthenticateActions()

                principal = authentication.principal as UserPrincipal
                jwt = tokenProvider.generateToken(authentication)
            } catch (exception: Exception) {
                loginException = exception
                throw exception
            }
        } catch (exception: BadCredentialsException) {
            loginResultCode = WRONG_PASSWORD_AUTH_RESULT_CODE
        } catch (exception: DisabledException) {
            loginResultCode = FAILURE_DELETED_AUTH_RESULT_CODE
        } catch (exception: TooManyAttemptsException) {
            loginResultCode = FAILURE_TOO_MANY_ATTEMPTS_AUTH_RESULT_CODE
        } catch (exception: Exception) {
            // log.error(exception) { "Exception in login method" }
            loginResultCode = ERROR_RESULT_CODE
        }

        val result = authenticationResultRepository.get(loginResultCode)

        if (formLogin != null) {
            // TODO: add clientInfo
            authenticationLogService.create(
                    operation = AuthenticationOperation.LOGIN,
                    result = result,
                    sessionId = jwt?.let { tokenProvider.getSessionIdFromJWT(it) },
                    user = principal?.user ?: kotlin.runCatching { userRepository.findByUsernameOrEmail(formLogin, formLogin).orElse(null) }.getOrNull(),
                    remoteAddress = remoteAddress,
                    formLogin = formLogin
            )
        } else {
            log.error(loginException) { "[FATAL LOGIC ERROR] formLogin is null" }
        }

        when {
            loginException == null -> return LoginResult(principal = principal!!, jwt = jwt!!)
            loginResultCode != ERROR_RESULT_CODE -> throw RuntimeException(result.name)
            else -> throw loginException
        }
    }

    fun logout() {
        val jwtToken = getRequest().jwtToken()

        val sessionId = jwtToken?.let { tokenProvider.getSessionIdFromJWT(it) }
        val userId = jwtToken?.let { tokenProvider.getUserIdFromJWT(it) }

        if (sessionId != null) {
            sessionManager.disableBySessionId(sessionId)

            userId?.let { userRepository.findById(it) }?.ifPresent {
                authenticationLogService.create(
                        operation = AuthenticationOperation.LOGOUT,
                        resultCode = SUCCESS_LOGOUT_COMMAND_RESULT_CODE,
                        sessionId = sessionId,
                        user = it,
                        remoteAddress = getRequest().clientIp
                )
            }
        }
    }

}
