package ru.sui.suisecurity.base.extension

import javax.servlet.http.HttpServletRequest

val HttpServletRequest.authorizationHeader: String?
    get() = this.getHeader("Authorization")

val HttpServletRequest.clientIp: String?
    get() = this.getHeader("X-Real-IP")
