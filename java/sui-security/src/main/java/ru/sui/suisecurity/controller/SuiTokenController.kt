package ru.sui.suisecurity.controller

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.async.DeferredResult
import ru.sui.suisecurity.security.JwtTokenProvider
import ru.sui.suisecurity.utils.VALIDATE_TOKEN_CACHE_TIMEOUT
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong
import javax.validation.Valid


private const val CHECK_TOKEN_TIMEOUT = 100_000L

@RestController
@RequestMapping("/api/token")
class SuiTokenController(private val tokenProvider: JwtTokenProvider) {

    private val requestIndex = AtomicLong()
    private val resultMap = ConcurrentHashMap<Long, Pair<String, DeferredResult<Boolean>>>()

    @PostMapping("/fastCheck")
    fun fastCheckToken(@Valid @RequestBody token: String) = tokenProvider.validateToken(token)

    @PostMapping("/check")
    fun checkToken(@Valid @RequestBody token: String): DeferredResult<Boolean> {
        val result = DeferredResult<Boolean>(CHECK_TOKEN_TIMEOUT, true)
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
