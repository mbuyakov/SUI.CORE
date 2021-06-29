package ru.sui.suisecurity.server.controller

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import ru.sui.suisecurity.base.security.CustomUserDetailsService
import ru.sui.suisecurity.base.utils.sudirTmpToken
import ru.sui.suisecurity.server.model.LoginRequest
import ru.sui.suisecurity.server.service.SudirService

@RestController
@RequestMapping("/api/auth/sudir")
@ConditionalOnExpression("\${sudir.enabled:false}")
class SudirController(
  val sudirService: SudirService,
  val suiAuthController: SuiAuthController,
  val customUserDetailsService: CustomUserDetailsService
) {

  @GetMapping("/callback")
  fun callback(@RequestParam code: String): ResponseEntity<*> {
    val headers = HttpHeaders()
    headers.add("Location", "/#/login?sudirCode=$code")
    return ResponseEntity<String>(headers, HttpStatus.FOUND)
  }

  @PostMapping("/signin")
  fun sudirSignin(@RequestParam code: String): ResponseEntity<*> {
    val teResponse = sudirService.te(code)
    val meResponse = sudirService.me(teResponse.accessToken)
    val email = meResponse.email ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Ваша учетная запись не имеет привязанного email адреса")
    try {
      customUserDetailsService.loadUserByUsername(email)
    } catch (e: UsernameNotFoundException) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь с email $email не найден")
    }
    return suiAuthController.signin(LoginRequest(email, sudirTmpToken))
  }
}
