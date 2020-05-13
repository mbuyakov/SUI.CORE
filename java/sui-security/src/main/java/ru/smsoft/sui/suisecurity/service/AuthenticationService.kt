package ru.smsoft.sui.suisecurity.service

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import ru.smsoft.sui.suientity.entity.log.AuthenticationLog
import ru.smsoft.sui.suientity.enums.AuthenticationOperation
import ru.smsoft.sui.suientity.repository.log.AuthenticationLogRepository
import ru.smsoft.sui.suientity.repository.suisecurity.UserRepository
import ru.smsoft.sui.suisecurity.exception.TooManyAttemptsException
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
        private val authenticationResultProvider: AuthenticationResultProvider,
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
                remoteAddress = getRequest().remoteAddr

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

        val result = authenticationResultProvider.resultByCode(loginResultCode)

        if (formLogin != null) {
            try {
                // generate log
                authenticationLogRepository.save(AuthenticationLog().apply {
                    this.operation = AuthenticationOperation.LOGIN
                    this.formLogin = formLogin
                    this.remoteAddress = remoteAddress
                    // this.clientInfo = ...
                    this.user = principal?.user ?: userRepository.findByUsernameOrEmail(formLogin, formLogin).orElse(null)
                    this.result = result
                })
            } catch (exception: Exception) {
                log.error(exception) { "Couldn't create AuthenticationLog" }
            }
        } else { // FATAL LOGIC ERROR
            log.error(loginException) { "[FATAL LOGIC ERROR] formLogin is null" }
        }

        when {
            loginException == null -> return LoginResult(principal = principal!!, jwt = jwt!!)
            loginResultCode != ERROR_RESULT_CODE -> throw RuntimeException(result.name)
            else -> throw loginException
        }
    }

    fun logout() {
        val userId = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).user.id

        sessionManager.disableUserSessions(userId)

        val result = authenticationResultProvider.resultByCode(SUCCESS_LOGOUT_COMMAND_RESULT_CODE)

        try {
            userRepository.findById(userId).ifPresent { user ->
                // generate log
                authenticationLogRepository.save(AuthenticationLog().apply {
                    this.operation = AuthenticationOperation.LOGOUT
                    this.user = user
                    this.remoteAddress = getRequest().remoteAddr
                    this.result = result
                })
            }
        } catch (exception: Exception) {
            log.error(exception) { "Couldn't create AuthenticationLog" }
        }
    }

}
