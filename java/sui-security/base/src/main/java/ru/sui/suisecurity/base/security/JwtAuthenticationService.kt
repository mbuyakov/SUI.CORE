package ru.sui.suisecurity.base.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service
import org.springframework.util.StringUtils
import ru.sui.suisecurity.base.extension.extractJwtToken


@Service
class JwtAuthenticationService {

    @Autowired
    private lateinit var tokenProvider: JwtTokenProvider
    @Autowired
    private lateinit var customUserDetailsService: CustomUserDetailsService

    fun getAuthentication(authorizationHeader: String?): UsernamePasswordAuthenticationToken? {
        val token = extractJwtToken(authorizationHeader)

        if (StringUtils.hasText(token) && tokenProvider.validateToken(token!!, false)) {
            val userId = tokenProvider.getUserIdFromJWT(token)

            // Note that you could also encode the user's username and roles inside JWT claims and fromUser the UserDetails object by parsing those claims from the JWT
            // That would avoid the following database hit. It's completely up to you.
            val userDetails = customUserDetailsService.loadUserById(userId)
            return UsernamePasswordAuthenticationToken(userDetails, null, userDetails.authorities)
        }

        return null
    }

}
