package ru.smsoft.sui.suisecurity.extension

import ru.smsoft.sui.suientity.entity.log.AuthenticationResult
import ru.smsoft.sui.suientity.repository.log.AuthenticationResultRepository
import ru.smsoft.sui.suisecurity.exception.ResourceNotFoundException

fun AuthenticationResultRepository.get(code: String): AuthenticationResult {
    return this
            .findByCode(code)
            .orElseThrow { ResourceNotFoundException("authentication_result", "code", code) }
}