package ru.sui.suisecurity.server.controller

import mu.KotlinLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.sui.suisecurity.server.service.AuthenticationService
import ru.sui.suisecurity.server.model.LoginRequest
import ru.sui.suisecurity.server.model.toResponseEntity
import javax.validation.Valid


private val log = KotlinLogging.logger { }

@RestController
@RequestMapping("/api/auth")
class SuiAuthController(private val authenticationService: AuthenticationService) {

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

}
