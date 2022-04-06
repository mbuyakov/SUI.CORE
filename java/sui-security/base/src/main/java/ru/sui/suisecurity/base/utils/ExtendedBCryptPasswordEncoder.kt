package ru.sui.suisecurity.base.utils

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

val skipPasswordCheckValue by lazy { "__SUI_SECURITY_SKIP_PASSWORD_CHECK-${java.util.UUID.randomUUID()}" }

class ExtendedBCryptPasswordEncoder : BCryptPasswordEncoder() {

    override fun matches(rawPassword: CharSequence, encodedPassword: String): Boolean {
        return if (rawPassword == skipPasswordCheckValue) true else super.matches(rawPassword, encodedPassword)
    }

}
