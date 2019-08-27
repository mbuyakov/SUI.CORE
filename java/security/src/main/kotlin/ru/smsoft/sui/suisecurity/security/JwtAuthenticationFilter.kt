package ru.smsoft.sui.suisecurity.security

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.lang.NonNull
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.web.filter.OncePerRequestFilter

import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class JwtAuthenticationFilter : OncePerRequestFilter() {
    private val log = KotlinLogging.logger {  }

    @Autowired
    private lateinit var jwtAuthenticationService: JwtAuthenticationService

    override fun doFilterInternal(
            @NonNull request: HttpServletRequest,
            @NonNull response: HttpServletResponse,
            @NonNull filterChain: FilterChain) {
        try {
            val authentication = jwtAuthenticationService.getAuthentication(request.getHeader("Authorization"))
            if (authentication != null) {
                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            log.error("Could not set user authentication in security context", e)
        }

        filterChain.doFilter(request, response)
    }

}
