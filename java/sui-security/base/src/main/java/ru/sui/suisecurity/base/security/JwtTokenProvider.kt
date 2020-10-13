package ru.sui.suisecurity.base.security

import io.jsonwebtoken.*
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.cache.annotation.Cacheable
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import ru.sui.suisecurity.base.extension.clientIp
import ru.sui.suisecurity.base.session.Session
import ru.sui.suisecurity.base.session.SessionManager
import ru.sui.suisecurity.base.utils.VALIDATE_TOKEN_CACHE
import ru.sui.suisecurity.base.utils.getRequest
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

        val expiryDate = Date(now.time + jwtExpiration)
        val sessionId = UUID.randomUUID()
        val userId = userPrincipal.user.id!!
        val remoteAddress = kotlin.runCatching { getRequest().clientIp }.getOrNull()

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

    fun getSessionIdFromJWT(token: String): UUID {
        return UUID.fromString(Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).body[SESSION_KEY] as String)
    }

    @Cacheable(VALIDATE_TOKEN_CACHE)
    fun validateToken(authToken: String, updateActivity: Boolean = true): Boolean {
        log.debug { "Call validateToken with token $authToken" }

        try {
            sessionManager.checkSession(getSessionIdFromJWT(authToken), updateActivity)

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
        } catch (ex: Exception) {
            log.error(ex.message, ex)
        }

        return false
    }

}
