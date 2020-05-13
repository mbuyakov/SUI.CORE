package ru.smsoft.sui.suisecurity.model

import org.springframework.http.ResponseEntity
import ru.smsoft.sui.suisecurity.security.UserPrincipal

fun LoginResult.toResponseEntity() = ResponseEntity.ok(JwtAuthenticationResponse(this.jwt, this.principal))

class JwtAuthenticationResponse(
    val accessToken: String,
    principal: UserPrincipal
) {

    val id: Long = principal.user.id
    val name: String = principal.user.name
    val roles = principal.authorities.map { it.toString() }.map { it.replace("ROLE_", "") }.toTypedArray()

}
