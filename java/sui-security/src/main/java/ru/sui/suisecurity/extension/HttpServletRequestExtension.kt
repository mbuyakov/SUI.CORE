package ru.sui.suisecurity.extension

import javax.servlet.http.HttpServletRequest

val HttpServletRequest.authorizationHeader: String?
    get() = this.getHeader("Authorization")

val HttpServletRequest.clientIp: String?
    get() = (this.getHeader("X-FORWARDED-FOR") ?: this.remoteAddr)?.let { if (it.contains(',')) it.split(',')[0] else it }
