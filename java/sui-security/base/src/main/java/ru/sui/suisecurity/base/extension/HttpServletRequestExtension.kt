package ru.sui.suisecurity.base.extension

import javax.servlet.http.HttpServletRequest

val HttpServletRequest.authorizationHeader: String?
    get() = this.getHeader("Authorization")

val HttpServletRequest.clientIp: String
    get() = "X-Real-IP=${this.getHeader("X-Real-IP")};X-FORWARDED-FOR=${this.getHeader("X-FORWARDED-FOR")};remoteAddr=${this.remoteAddr}"
