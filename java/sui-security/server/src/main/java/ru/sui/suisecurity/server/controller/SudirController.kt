package ru.sui.suisecurity.server.controller

import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import ru.sui.suisecurity.base.utils.sudirTmpToken
import ru.sui.suisecurity.server.model.LoginRequest
import ru.sui.suisecurity.server.service.SudirService

@RestController
@RequestMapping("/api/auth/sudir")
@ConditionalOnExpression("\${sudir.enabled:false}")
class SudirController(
  val sudirService: SudirService,
  val suiAuthController: SuiAuthController
) {

  @PostMapping("/callback")
  fun callback(@RequestParam code: String) : ResponseEntity<*> {
    val headers = HttpHeaders()
    headers.add("Location", "/#/login?sudirCode=$code")
    return ResponseEntity<String>(headers, HttpStatus.FOUND)
  }

  @PostMapping("/signin")
  fun sudirSignin(@RequestParam code: String) {
    val teResponse = sudirService.te(code)
    val meResponse = sudirService.me(teResponse.accessToken)
    suiAuthController.signin(LoginRequest(meResponse.email, sudirTmpToken))
  }
}
