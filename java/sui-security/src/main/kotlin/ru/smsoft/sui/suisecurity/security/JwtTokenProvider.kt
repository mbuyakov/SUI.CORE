package ru.smsoft.sui.suisecurity.security

import io.jsonwebtoken.*
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import ru.smsoft.sui.suisecurity.exception.ExpiredSessionException
import ru.smsoft.sui.suisecurity.redis.Session
import ru.smsoft.sui.suisecurity.redis.SessionRepository
import java.util.*

private const val SESSION_KEY = "__sui_session"
private val log = KotlinLogging.logger {  }

@Component
class JwtTokenProvider {

    @Autowired(required = false)
    private var sessionRepository: SessionRepository? = null

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

        sessionRepository?.save(Session(
                id = sessionId,
                userId = userId,
                expiryDate = expiryDate
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

    fun validateToken(authToken: String): Boolean {
        try {
            val sessionId = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken).body[SESSION_KEY] as String?

            if (sessionId != null && sessionRepository != null) {
                val session = sessionRepository!!
                        .findById(UUID.fromString(sessionId))
                        .orElseThrow { ExpiredSessionException() }
            }

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
        } catch (ex: ExpiredSessionException) {
            log.error(ex.message)
        }

        return false
    }

}
