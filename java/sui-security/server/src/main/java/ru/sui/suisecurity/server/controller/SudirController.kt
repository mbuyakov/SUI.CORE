package ru.sui.suisecurity.server.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import ru.sui.suisecurity.base.security.CustomUserDetailsService
import ru.sui.suisecurity.base.security.UserPrincipal
import ru.sui.suisecurity.base.utils.skipPasswordCheckValue
import ru.sui.suisecurity.server.model.LoginRequest
import ru.sui.suisecurity.server.service.SudirService
import ru.sui.suisecurity.server.service.SudirValidator

@RestController
@RequestMapping("/api/auth/sudir")
@ConditionalOnExpression("\${sudir.enabled:false}")
class SudirController(
  val sudirService: SudirService,
  @Autowired(required = false)
  val sudirValidator: SudirValidator?,
  val suiAuthController: SuiAuthController,
  val customUserDetailsService: CustomUserDetailsService,
  @Value("\${sudir.redirect_uri}")
  val redirectUri: String
) {

  @GetMapping("/callback")
  fun callback(@RequestParam code: String): ResponseEntity<*> {
    val headers = HttpHeaders()
    headers.add("Location", "${redirectUri.replace("callback", "")}#/login?sudirCode=$code")
    return ResponseEntity<String>(headers, HttpStatus.FOUND)
  }

  @PostMapping("/signin")
  fun sudirSignin(@RequestParam code: String): ResponseEntity<*> {
    val teResponse = sudirService.te(code)
    val meResponse = sudirService.me(teResponse.accessToken)

    val email = meResponse.email ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Ваша учетная запись не имеет привязанного email адреса")
    val userPrincipal: UserPrincipal

    try {
      userPrincipal = customUserDetailsService.loadUserByUsername(email) as UserPrincipal
    } catch (e: UsernameNotFoundException) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Пользователь с email $email не найден")
    }

    try {
        sudirValidator?.validate(userPrincipal.user, teResponse, meResponse)
    } catch (exception: Exception) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(exception.message)
    }

    return suiAuthController.signin(LoginRequest(email, skipPasswordCheckValue))
  }

}
