package ru.sui.suisecurity.server.model

import org.springframework.http.ResponseEntity
import ru.sui.suisecurity.base.model.LoginResult
import ru.sui.suisecurity.base.security.UserPrincipal


fun LoginResult.toResponseEntity(): ResponseEntity<JwtAuthenticationResponse> {
    return ResponseEntity.ok(JwtAuthenticationResponse(this.jwt, this.principal))
}

class JwtAuthenticationResponse(
    val accessToken: String,
    principal: UserPrincipal
) {

    val id: Long = principal.user.id
    val name: String = principal.user.name
    val roles = principal.authorities.map { it.toString() }.map { it.replace("ROLE_", "") }.toTypedArray()

}
