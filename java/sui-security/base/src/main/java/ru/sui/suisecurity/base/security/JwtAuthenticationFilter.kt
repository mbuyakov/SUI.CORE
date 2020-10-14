package ru.sui.suisecurity.base.security

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.lang.NonNull
import org.springframework.web.filter.OncePerRequestFilter
import ru.sui.suisecurity.base.extension.authorizationHeader
import ru.sui.suisecurity.base.utils.postAuthenticateActions
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


private val log = KotlinLogging.logger {  }

class JwtAuthenticationFilter : OncePerRequestFilter() {

    @Autowired
    private lateinit var jwtAuthenticationService: JwtAuthenticationService

    override fun doFilterInternal(
            @NonNull request: HttpServletRequest,
            @NonNull response: HttpServletResponse,
            @NonNull filterChain: FilterChain
    ) {
        try {
            jwtAuthenticationService
                    .getAuthentication(request.authorizationHeader)
                    ?.postAuthenticateActions()
        } catch (e: Exception) {
            log.error("Could not set user authentication in security context", e)
        }

        filterChain.doFilter(request, response)
    }

}
