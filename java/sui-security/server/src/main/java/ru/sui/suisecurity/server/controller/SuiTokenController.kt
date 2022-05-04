package ru.sui.suisecurity.server.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.async.DeferredResult
import ru.sui.suisecurity.base.security.JwtTokenProvider
import ru.sui.suisecurity.base.utils.VALIDATE_TOKEN_CACHE_TIMEOUT
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong
import javax.validation.Valid

@RestController
@RequestMapping("/api/token")
class SuiTokenController(
    @Value("\${security.token-check-timeout:100000}") private val tokenCheckTimeout: Long,
    private val tokenProvider: JwtTokenProvider
) {

    private val requestIndex = AtomicLong()
    private val resultMap = ConcurrentHashMap<Long, Pair<String, DeferredResult<Boolean>>>()

    @PostMapping("/fastCheck")
    fun fastCheckToken(@Valid @RequestBody token: String) = tokenProvider.validateToken(token)

    @PostMapping("/check")
    fun checkToken(@Valid @RequestBody token: String): DeferredResult<Boolean> {
        val result = DeferredResult<Boolean>(tokenCheckTimeout, true)
        resultMap[requestIndex.incrementAndGet()] = token to result
        return result
    }

    @Scheduled(fixedDelay = VALIDATE_TOKEN_CACHE_TIMEOUT)
    fun validateTokens() {
        resultMap.toList().parallelStream().forEach { (index, entry) ->
            val (token, result) = entry

            if (!tokenProvider.validateToken(token)) {
                result.setResult(false)
            }

            if (result.isSetOrExpired) {
                resultMap.remove(index)
            }
        }
    }

}
