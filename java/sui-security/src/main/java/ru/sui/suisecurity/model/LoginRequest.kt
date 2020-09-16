package ru.sui.suisecurity.model

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import javax.validation.constraints.NotBlank


class LoginRequest(
        @NotBlank
        val usernameOrEmail: String,
        @NotBlank
        val password: String
) {

    fun toAuthenticationToken() = UsernamePasswordAuthenticationToken(usernameOrEmail, password)

}
