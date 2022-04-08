package ru.sui.suisecurity.server.controller

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.ldap.search.LdapUserSearch
import org.springframework.web.bind.annotation.*
import ru.sui.suisecurity.base.utils.skipPasswordCheckValue
import ru.sui.suisecurity.server.model.LoginRequest
import ru.sui.suisecurity.server.model.toResponseEntity
import ru.sui.suisecurity.server.service.AuthenticationService
import ru.sui.suisecurity.server.service.LdapSupportService
import javax.validation.Valid

private const val WRONG_USERNAME_OR_PASSWORD_MESSAGE= "Неправильный логин или пароль"

@RestController
@RequestMapping("/api/auth/ldap")
@ConditionalOnBean(LdapUserSearch::class)
class LdapController(
    private val authenticationService: AuthenticationService,
    private val ldapUserSearch: LdapUserSearch,
    private val ldapSupportService: LdapSupportService
) {

    @Suppress("LiftReturnOrAssignment")
    @PostMapping("/signin")
    fun signin(@Valid @RequestBody req: LoginRequest): ResponseEntity<*> {
        val searchResult = try {
            ldapUserSearch.searchForUser(req.usernameOrEmail)
        } catch (exception: UsernameNotFoundException) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(WRONG_USERNAME_OR_PASSWORD_MESSAGE)
        }

        if (!ldapSupportService.checkPassword(req.password, searchResult)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(WRONG_USERNAME_OR_PASSWORD_MESSAGE)
        }

        try {
            val localUser = ldapSupportService.createOrUpdateLocalUser(searchResult)
            val token = UsernamePasswordAuthenticationToken(localUser.username, skipPasswordCheckValue)
            return authenticationService.login(token).toResponseEntity()
        } catch (exception: Exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.message)
        }
    }

}