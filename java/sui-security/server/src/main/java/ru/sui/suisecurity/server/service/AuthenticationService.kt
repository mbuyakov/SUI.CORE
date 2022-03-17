package ru.sui.suisecurity.server.service

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.DisabledException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service
import ru.sui.suientity.entity.log.AuthenticationLog
import ru.sui.suientity.entity.suisecurity.User
import ru.sui.suientity.enums.AuthenticationOperation
import ru.sui.suientity.repository.log.AuthenticationLogRepository
import ru.sui.suientity.repository.log.AuthenticationResultRepository
import ru.sui.suientity.repository.suisecurity.UserRepository
import ru.sui.suisecurity.base.exception.TooManyAttemptsException
import ru.sui.suisecurity.base.exception.UserBlockedException
import ru.sui.suisecurity.base.extension.clientIp
import ru.sui.suisecurity.base.extension.get
import ru.sui.suisecurity.base.extension.jwtToken
import ru.sui.suisecurity.base.model.LoginResult
import ru.sui.suisecurity.base.security.CustomUserDetailsService
import ru.sui.suisecurity.base.security.JwtTokenProvider
import ru.sui.suisecurity.base.security.UserPrincipal
import ru.sui.suisecurity.base.service.AuthenticationLogService
import ru.sui.suisecurity.base.session.SessionManager
import ru.sui.suisecurity.base.utils.*
import java.time.Duration
import java.util.*

private val log = KotlinLogging.logger {  }

@Service
@Suppress("ThrowableNotThrown", "UNCHECKED_CAST")
class AuthenticationService(
    // properties
    @Value(value = "\${security.login.block-attempts-count:-1}") private val blockAttemptsCount: Int,
    @Value(value = "\${security.login.max-attempts-count:25}") private val maxAttemptsCount: Int,
    @Value(value = "\${security.login.max-attempts-period:3600000}") private var maxAttemptsPeriod: Long,
    // services
    private val authenticationManager: AuthenticationManager,
    private val tokenProvider: JwtTokenProvider,
    private val sessionManager: SessionManager,
    private val authenticationLogService: AuthenticationLogService,
    private val customUserDetailsService: CustomUserDetailsService,
    // repos
    private val authenticationResultRepository: AuthenticationResultRepository,
    private val authenticationLogRepository: AuthenticationLogRepository,
    private val userRepository: UserRepository
) {

    fun login(token: UsernamePasswordAuthenticationToken): LoginResult {
        var loginResultCode: String = SUCCESS_LOGIN_AUTH_RESULT_CODE
        var loginException: Exception? = null

        var formLogin: String? = null
        var remoteAddress: String? = null

        var principal: UserPrincipal? = null
        var jwt: String? = null

        try {
            formLogin = token.principal as String
            remoteAddress = getRequest().clientIp

            // Проверяем, что пользователь не превысил максимальное кол-во попыток входа
            if (maxAttemptsCount > 0) {
                val attempts = getLoginAttemptsCount(formLogin, remoteAddress, Duration.ofMillis(maxAttemptsPeriod))

                if (attempts >= maxAttemptsCount) {
                    throw TooManyAttemptsException()
                }
            }

            // Проверяем, что пользователь не заблокирован
            val user = findUserByFormLogin(formLogin)

            if (user != null && user.blocked) {
                throw UserBlockedException(user)
            }

            // Аутентифицируем пользователя
            val authentication = authenticationManager.authenticate(token) as UsernamePasswordAuthenticationToken
            authentication.postAuthenticateActions()
            principal = authentication.principal as UserPrincipal
            jwt = tokenProvider.generateToken(authentication)
        } catch (exception: BadCredentialsException) {
            loginException = exception
            loginResultCode = WRONG_PASSWORD_AUTH_RESULT_CODE
        } catch (exception: DisabledException) {
            loginException = exception
            loginResultCode = FAILURE_DELETED_AUTH_RESULT_CODE
        } catch (exception: TooManyAttemptsException) {
            loginException = exception
            loginResultCode = FAILURE_TOO_MANY_ATTEMPTS_AUTH_RESULT_CODE
        } catch (exception: UserBlockedException) {
            loginException = exception
            loginResultCode = FAILURE_BLOCKED_AUTH_RESULT_CODE
        } catch (exception: Exception) {
            loginException = exception
            loginResultCode = ERROR_RESULT_CODE
        }

        if (formLogin == null) {
            log.error(loginException) { "[FATAL LOGIC ERROR] formLogin is null" }
        }

        val user = principal?.user ?: findUserByFormLogin(formLogin!!)
        val result = authenticationResultRepository.get(loginResultCode)

        // Блокируем пользователя (если надо)
        if (user != null && !user.blocked && !result.success) {
            val lastAuthLogs = getPrevNAuthenticationLogs(user, blockAttemptsCount - 1) // -1 т.к. текущая еще на сохранена

            if (lastAuthLogs.size == (blockAttemptsCount - 1) && lastAuthLogs.all { !it.result.success }) {
                user.blocked = true
                userRepository.save(user)
                sessionManager.disableByUserId(user.id, SUCCESS_LOGOUT_COMMAND_RESULT_CODE)
            }
        }

        // TODO: add clientInfo
        authenticationLogService.create(
            operation = AuthenticationOperation.LOGIN,
            result = result,
            sessionId = jwt?.let { tokenProvider.getSessionIdFromJWT(it) },
            user = user,
            remoteAddress = remoteAddress,
            formLogin = formLogin
        )

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

    private fun findUserByFormLogin(formLogin: String): User? {
        return kotlin.runCatching { customUserDetailsService.loadUserByUsername(formLogin) }
            .getOrNull()
            ?.let { it as UserPrincipal }
            ?.user
    }

    private fun getLoginAttemptsCount(formLogin: String, remoteAddress: String, duration: Duration): Long {
        return authenticationLogRepository.countByOperationAndRemoteAddressAndFormLoginAndCreatedIsGreaterThanEqual(
            AuthenticationOperation.LOGIN,
            remoteAddress,
            formLogin,
            Date(Date().time - duration.toMillis())
        )
    }

    private fun getPrevNAuthenticationLogs(user: User, count: Int): List<AuthenticationLog> {
        return authenticationLogRepository.findAllByOperationAndUser(
            AuthenticationOperation.LOGIN,
            user,
            PageRequest.of(0, count, Sort.by(Sort.Direction.DESC, "created"))
        )
    }

}
