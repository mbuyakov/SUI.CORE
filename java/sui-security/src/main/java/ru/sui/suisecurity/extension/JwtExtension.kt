package ru.sui.suisecurity.extension

import javax.servlet.http.HttpServletRequest

fun extractJwtToken(authorizationHeader: String?): String? {
    // Bearer case insensitive
    return if (authorizationHeader != null && authorizationHeader.toLowerCase().startsWith("bearer ")) {
      authorizationHeader.substring("bearer ".length)
    } else {
      authorizationHeader
    }
}

fun HttpServletRequest.jwtToken() = extractJwtToken(this.authorizationHeader)
