package ru.smsoft.sui.suisecurity.security

import io.jsonwebtoken.*
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.Cacheable
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.WebAuthenticationDetails
import org.springframework.stereotype.Component
import ru.smsoft.sui.suisecurity.exception.SessionException
import ru.smsoft.sui.suisecurity.session.Session
import ru.smsoft.sui.suisecurity.session.SessionManager
import ru.smsoft.sui.suisecurity.utils.VALIDATE_TOKEN_CACHE
import java.util.*

private const val SESSION_KEY = "__sui_session"
private val log = KotlinLogging.logger {  }

@Component
class JwtTokenProvider {

    @Autowired
    private lateinit var sessionManager: SessionManager

    @Value("\${jwtSecret}")
    private val jwtSecret: String? = null
    @Value("\${jwtExpiration}")
    private val jwtExpiration: Int = 0

    fun generateToken(authentication: Authentication): String {
        val userPrincipal = authentication.principal as UserPrincipal
        val now = Date()
        val details = authentication.details

        val expiryDate = Date(now.time + jwtExpiration)
        val sessionId = UUID.randomUUID()
        val userId = userPrincipal.user.id!!
        val remoteAddress = if (details is WebAuthenticationDetails) details.remoteAddress else null

        sessionManager.createSession(Session(
            id = sessionId,
            userId = userId,
            expiryDate = expiryDate,
            remoteAddress = remoteAddress
        ))

        return Jwts.builder()
                .setSubject(userId.toString())
                .setIssuedAt(Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .claim(SESSION_KEY, sessionId)
                .compact()
    }

    fun getUserIdFromJWT(token: String): Long {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .body
                .subject
                .toLong()
    }

    @Cacheable(VALIDATE_TOKEN_CACHE)
    fun validateToken(authToken: String): Boolean {
        log.debug { "Call validateToken with token $authToken" }

        try {
            val sessionId = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken).body[SESSION_KEY] as String?
            val session = sessionManager.getSession(sessionId?.let { UUID.fromString(it) })

            return true
        } catch (ex: SignatureException) {
            log.error("Invalid JWT signature")
        } catch (ex: MalformedJwtException) {
            log.error("Invalid JWT token")
        } catch (ex: ExpiredJwtException) {
            log.error("Expired JWT token")
        } catch (ex: UnsupportedJwtException) {
            log.error("Unsupported JWT token")
        } catch (ex: IllegalArgumentException) {
            log.error("JWT claims string is empty.")
        } catch (ex: SessionException) {
            log.error(ex.message)
        }

        return false
    }

}
