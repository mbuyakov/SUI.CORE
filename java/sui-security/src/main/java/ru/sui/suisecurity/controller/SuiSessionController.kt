package ru.sui.suisecurity.controller

import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.sui.suisecurity.session.SessionManager
import ru.sui.suisecurity.utils.SUCCESS_LOGOUT_BY_ADMIN_RESULT_CODE
import java.util.*


@RestController
@RequestMapping("/api/session")
class SuiSessionController(private val sessionManager: SessionManager) {

  @PostMapping("/disable/{sessionId}")
  @PreAuthorize("hasRole('ADMIN')")
  fun disableSession(@PathVariable("sessionId") sessionId: UUID) {
    sessionManager.disableBySessionId(sessionId, SUCCESS_LOGOUT_BY_ADMIN_RESULT_CODE)
  }

}
