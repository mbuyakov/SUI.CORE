package ru.sui.suisecurity.server.model

import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import ru.sui.suisecurity.base.model.LoginResult
import ru.sui.suisecurity.base.security.UserPrincipal
import java.net.HttpCookie

fun LoginResult.toResponseEntity(): ResponseEntity<JwtAuthenticationResponse> {
    val tokenCookie = HttpCookie("_sui_token", this.jwt)

    tokenCookie.path = "/"
    tokenCookie.secure = true
    tokenCookie.isHttpOnly = true

    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, tokenCookie.toString())
        .body(JwtAuthenticationResponse(this.jwt, this.principal))
}

class JwtAuthenticationResponse(
    val accessToken: String,
    principal: UserPrincipal
) {

    val id: Long = principal.user.id
    val name: String = principal.user.name
    val roles = principal.user.roles.map { it.name }.map { it.replace("ROLE_", "") }.toTypedArray()
    val authorities = principal.authorities.map { it.toString() }.map { it.replace("ROLE_", "") }.toTypedArray()

}
