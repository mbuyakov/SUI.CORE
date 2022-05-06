package ru.sui.suisecurity.server.service

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import java.util.*

private val log = KotlinLogging.logger { }
private val restTemplate = RestTemplate()

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy::class)
data class TeResponse(
  val idToken: String,
  val accessToken: String,
  val expiresIn: Int,
  val scope: String,
  val tokenType: String
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MeResponse(
  val uid: String,
  val email: String?
)

@Service
@ConditionalOnExpression("\${sudir.enabled:false}")
class SudirService(
  @Value("\${sudir.url}")
  val url: String,
  @Value("\${sudir.username}")
  val username: String,
  @Value("\${sudir.password}")
  val password: String,
  @Value("\${sudir.redirect_uri}")
  val redirectUri: String
) {
  fun te(code: String): TeResponse {
    val headers = HttpHeaders()
    val basicString = Base64.getEncoder().encodeToString("$username:$password".toByteArray())
    headers.set("Authorization", "Basic $basicString")
    val entity = HttpEntity<Any>(headers)
    val response = restTemplate.exchange("${url}/blitz/oauth/te?code=$code&redirect_uri=$redirectUri", HttpMethod.POST, entity, TeResponse::class.java)
    val body = response.body!!
    log.info { "SUDIR te resp $body" }
    return body
  }

  fun me(accessToken: String): MeResponse {
    val headers = HttpHeaders()
    headers.set("Authorization", "Bearer $accessToken")
    val entity = HttpEntity<Any>(headers)
    val response = restTemplate.exchange("${url}/blitz/oauth/me", HttpMethod.GET, entity, MeResponse::class.java)
    val body = response.body!!
    log.info { "SUDIR me resp $body" }
    return body
  }
}

