package ru.smsoft.sui.suisecurity.service

import org.springframework.stereotype.Service
import ru.smsoft.sui.suientity.entity.log.AuthenticationResult
import ru.smsoft.sui.suientity.repository.log.AuthenticationResultRepository
import ru.smsoft.sui.suisecurity.exception.ResourceNotFoundException


@Service
class AuthenticationResultProvider(
    private val authenticationResultRepository: AuthenticationResultRepository
) {

    fun resultByCode(code: String) : AuthenticationResult {
        return authenticationResultRepository
                .findByCode(code)
                .orElseThrow { ResourceNotFoundException("authentication_result", "code", code) }
    }

}
