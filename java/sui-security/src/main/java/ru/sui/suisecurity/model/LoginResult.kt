package ru.sui.suisecurity.model

import ru.sui.suisecurity.security.UserPrincipal

class LoginResult(
    val principal: UserPrincipal,
    val jwt: String
)
