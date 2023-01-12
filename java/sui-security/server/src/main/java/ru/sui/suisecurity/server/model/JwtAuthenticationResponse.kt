package ru.sui.suisecurity.server.model

import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseCookie
import org.springframework.http.ResponseEntity
import ru.sui.suisecurity.base.model.LoginResult
import ru.sui.suisecurity.base.security.UserPrincipal
import java.time.Duration

fun LoginResult.toResponseEntity(): ResponseEntity<JwtAuthenticationResponse> {
    val tokenCookie = ResponseCookie.from("_sui_token", this.jwt)
        .maxAge(Duration.ofDays(3650))
        .path("/")
        .secure(true)
        .httpOnly(true)
        .build()
        .toString()

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
