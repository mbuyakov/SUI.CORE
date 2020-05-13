package ru.smsoft.sui.suisecurity.controller

import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.smsoft.sui.suisecurity.model.LoginRequest
import ru.smsoft.sui.suisecurity.model.toResponseEntity
import ru.smsoft.sui.suisecurity.security.JwtTokenProvider
import ru.smsoft.sui.suisecurity.service.AuthenticationService
import java.lang.Exception
import javax.validation.Valid


private val log = KotlinLogging.logger { }

@Suppress("MVCPathVariableInspection")
@RestController
@RequestMapping("\${security.controller.auth-path:/api/auth}")
class SuiAuthController(
        private val authenticationService: AuthenticationService,
        private val tokenProvider: JwtTokenProvider
) {

    @PostMapping("/signin")
    fun signin(@Valid @RequestBody req: LoginRequest) : ResponseEntity<*> {
        return try {
            authenticationService.login(req.toAuthenticationToken()).toResponseEntity()
        } catch (exception: Exception) {
            log.debug(exception) { "Exception in signin" }
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.message)
        }
    }

    @PostMapping("/signout")
    fun signout() {
        authenticationService.logout()
    }

    @PostMapping("/checkToken")
    fun checkToken(@Valid @RequestBody token: String): ResponseEntity<Boolean> = ResponseEntity.ok(tokenProvider.validateToken(token))

}