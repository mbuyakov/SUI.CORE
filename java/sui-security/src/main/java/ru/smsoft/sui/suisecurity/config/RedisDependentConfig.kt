package ru.smsoft.sui.suisecurity.config

import org.redisson.api.RedissonClient
import org.redisson.spring.starter.RedissonAutoConfiguration
import org.springframework.boot.autoconfigure.AutoConfigurationImportFilter
import org.springframework.boot.autoconfigure.AutoConfigurationMetadata
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.EnvironmentAware
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.core.env.Environment
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories
import ru.smsoft.sui.suisecurity.lock.LocalLockProvider
import ru.smsoft.sui.suisecurity.lock.RedissonLockProvider
import ru.smsoft.sui.suisecurity.session.jpa.JpaSessionRepository
import ru.smsoft.sui.suisecurity.session.jpa.JpaSessionService
import ru.smsoft.sui.suisecurity.session.redis.RedisSessionRepository
import ru.smsoft.sui.suisecurity.session.redis.RedisSessionService


private const val REDIS_ENABLE_FLAG = "spring.redis.host"

private val TRUE_MAPPER: (String?) -> Boolean = { true }
private val DISABLE_REDIS_MAPPER: (String?) -> Boolean = {
    it != RedissonAutoConfiguration::class.qualifiedName && it != RedisAutoConfiguration::class.qualifiedName
}

@Configuration
@ConditionalOnProperty(REDIS_ENABLE_FLAG)
@EnableRedisRepositories("ru.smsoft.sui.suisecurity.session.redis")
class RedisEnabledConfig(
        private val redisSessionRepository: RedisSessionRepository,
        private val redisson: RedissonClient
) {

    @Bean
    @Primary // disable IDEA error
    fun redisSessionService() = RedisSessionService(redisSessionRepository)

    @Bean
    @Primary // disable IDEA error
    fun redissonLockProvider() = RedissonLockProvider(redisson)

}

@Configuration
@ConditionalOnProperty(REDIS_ENABLE_FLAG, matchIfMissing = true)
@EntityScan("ru.smsoft.sui.suisecurity.session.jpa")
@EnableJpaRepositories("ru.smsoft.sui.suisecurity.session.jpa")
class RedisDisabledConfig(private val jpaSessionRepository: JpaSessionRepository) {

    @Bean
    fun jpaSessionService() = JpaSessionService(jpaSessionRepository)

    @Bean
    fun localLockProvider() = LocalLockProvider()

}

class RedisAutoConfigurationImportFilter : AutoConfigurationImportFilter, EnvironmentAware {

    private lateinit var _environment: Environment

    override fun setEnvironment(environment: Environment) {
        this._environment = environment
    }

    override fun match(autoConfigurationClasses: Array<String?>, metadata: AutoConfigurationMetadata): BooleanArray {
        return autoConfigurationClasses
                .map(if (_environment.containsProperty(REDIS_ENABLE_FLAG)) TRUE_MAPPER else DISABLE_REDIS_MAPPER)
                .toBooleanArray()
    }

}