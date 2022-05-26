package ru.sui.suisecurity.server.controller

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import ru.sui.suisecurity.base.utils.skipPasswordCheckValue
import ru.sui.suisecurity.server.ldap.LdapAuthenticationHelper
import ru.sui.suisecurity.server.ldap.LdapUserConverter
import ru.sui.suisecurity.server.model.LoginRequest
import ru.sui.suisecurity.server.model.toResponseEntity
import ru.sui.suisecurity.server.service.AuthenticationService
import javax.validation.Valid

@RestController
@RequestMapping("/api/auth/ldap")
@ConditionalOnBean(LdapAuthenticationHelper::class)
class LdapController(
    private val authenticationService: AuthenticationService,
    private val ldapAuthenticationHelper: LdapAuthenticationHelper,
    private val ldapUserConverter: LdapUserConverter
) {

    @Suppress("LiftReturnOrAssignment")
    @PostMapping("/signin")
    fun signin(@Valid @RequestBody req: LoginRequest): ResponseEntity<*> {
        val user = ldapAuthenticationHelper.authenticate(req.usernameOrEmail, req.password)
            ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неправильный логин или пароль")

        val groups = try {
            ldapAuthenticationHelper.searchForGroups(user.dn.toString())
        } catch (exception: UsernameNotFoundException) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Не удалось получить группы пользователя")
        }

        try {
            val localUser = ldapUserConverter.createOrUpdateLocalUser(user, groups)
            val token = UsernamePasswordAuthenticationToken(localUser.username, skipPasswordCheckValue)
            return authenticationService.login(token).toResponseEntity()
        } catch (exception: Exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.message)
        }
    }

}