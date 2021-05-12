package ru.sui.suisecurity.base.utils

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import ru.sui.suisecurity.base.service.sudirTmpToken

class SudirBCryptPasswordEncoder: BCryptPasswordEncoder() {
  override fun matches(rawPassword: CharSequence, encodedPassword: String): Boolean {
    return if(rawPassword == sudirTmpToken) true else super.matches(rawPassword, encodedPassword)
  }
}
