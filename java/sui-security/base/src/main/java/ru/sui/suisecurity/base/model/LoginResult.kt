package ru.sui.suisecurity.base.model

import ru.sui.suisecurity.base.security.UserPrincipal

class LoginResult(val principal: UserPrincipal, val jwt: String)
