package ru.sui.suisecurity.base.extension

import java.util.*
import javax.servlet.http.HttpServletRequest

fun extractJwtToken(authorizationHeader: String?): String? {
    // Bearer case insensitive
    return if (authorizationHeader != null && authorizationHeader.lowercase(Locale.getDefault()).startsWith("bearer ")) {
      authorizationHeader.substring("bearer ".length)
    } else {
      authorizationHeader
    }
}

fun HttpServletRequest.jwtToken() = extractJwtToken(this.authorizationHeader)
