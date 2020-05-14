package ru.smsoft.sui.suisecurity.extension

import javax.servlet.http.HttpServletRequest

fun extractJwtToken(authorizationHeader: String?): String? {
    // Bearer case insensitive
    return if (authorizationHeader != null && authorizationHeader.toLowerCase().startsWith("bearer ")) {
      authorizationHeader.substring("bearer ".length)
    } else {
      authorizationHeader
    }
}

val HttpServletRequest.authorizationHeader
    get() = this.getHeader("Authorization")

fun HttpServletRequest.jwtToken() = extractJwtToken(this.authorizationHeader)
