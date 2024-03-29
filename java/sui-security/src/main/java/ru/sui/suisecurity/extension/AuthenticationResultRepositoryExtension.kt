package ru.sui.suisecurity.extension

import ru.sui.suientity.entity.log.AuthenticationResult
import ru.sui.suientity.repository.log.AuthenticationResultRepository
import ru.sui.suisecurity.exception.ResourceNotFoundException

fun AuthenticationResultRepository.get(code: String): AuthenticationResult {
    return this
            .findByCode(code)
            .orElseThrow { ResourceNotFoundException("authentication_result", "code", code) }
}
