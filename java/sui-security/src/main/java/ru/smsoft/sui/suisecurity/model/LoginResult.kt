package ru.smsoft.sui.suisecurity.model

import ru.smsoft.sui.suisecurity.security.UserPrincipal

class LoginResult(
    val principal: UserPrincipal,
    val jwt: String
)
