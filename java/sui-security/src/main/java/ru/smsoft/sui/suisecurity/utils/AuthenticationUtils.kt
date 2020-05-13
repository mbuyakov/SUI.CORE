package ru.smsoft.sui.suisecurity.utils

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import javax.servlet.http.HttpServletRequest

fun UsernamePasswordAuthenticationToken.postAuthenticateActions() {
    SecurityContextHolder.getContext().authentication = this
    this.details = WebAuthenticationDetails(getRequest())
}

fun getRequest(): HttpServletRequest {
    val requestAttributes = RequestContextHolder.getRequestAttributes() as ServletRequestAttributes?

    if (requestAttributes != null) {
        return requestAttributes.request
    } else {
        throw RuntimeException("RequestAttributes is null")
    }
}