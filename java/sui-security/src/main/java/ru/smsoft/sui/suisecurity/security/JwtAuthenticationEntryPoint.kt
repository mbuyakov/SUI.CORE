package ru.smsoft.sui.suisecurity.security

import mu.KotlinLogging
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import java.io.IOException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class JwtAuthenticationEntryPoint : AuthenticationEntryPoint {
    private val log = KotlinLogging.logger {  }

    @Throws(IOException::class)
    override fun commence(httpServletRequest: HttpServletRequest, httpServletResponse: HttpServletResponse, e: AuthenticationException) {
        log.error("Responding with unauthorized error. Message - {}", e.message)
        httpServletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.message)
    }
}
