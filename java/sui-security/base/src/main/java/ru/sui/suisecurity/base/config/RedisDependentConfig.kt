package ru.sui.suisecurity.base.config

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
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.transaction.PlatformTransactionManager
import ru.sui.suisecurity.base.lock.JdbcLockProvider
import ru.sui.suisecurity.base.lock.RedissonLockProvider
import ru.sui.suisecurity.base.session.jpa.JpaSessionRepository
import ru.sui.suisecurity.base.session.jpa.JpaSessionService
import ru.sui.suisecurity.base.session.redis.RedisSessionRepository
import ru.sui.suisecurity.base.session.redis.RedisSessionService
import javax.annotation.PostConstruct


private const val REDIS_ENABLE_FLAG = "spring.redis.host"

private val TRUE_MAPPER: (String?) -> Boolean = { true }
private val DISABLE_REDIS_MAPPER: (String?) -> Boolean = {
    it != RedissonAutoConfiguration::class.qualifiedName && it != RedisAutoConfiguration::class.qualifiedName
}

@Configuration
@ConditionalOnProperty(REDIS_ENABLE_FLAG)
@EnableRedisRepositories("ru.sui.suisecurity.base.session.redis")
class RedisEnabledConfig(
        private val redisSessionRepository: RedisSessionRepository,
        private val redisTemplates: List<RedisTemplate<Any, Any>>,
        private val redisson: RedissonClient
) {

    @PostConstruct
    fun postConstruct() {
        redisTemplates.forEach { it.setEnableTransactionSupport(true) }
    }

    @Bean
    @Primary // disable IDEA error
    fun redisSessionService() = RedisSessionService(redisSessionRepository)

    @Bean
    @Primary // disable IDEA error
    fun redissonLockProvider() = RedissonLockProvider(redisson)

}

@Configuration
@ConditionalOnProperty(REDIS_ENABLE_FLAG, matchIfMissing = true)
@EntityScan("ru.sui.suisecurity.base.session.jpa")
@EnableJpaRepositories("ru.sui.suisecurity.base.session.jpa")
class RedisDisabledConfig(
        private val jpaSessionRepository: JpaSessionRepository,
        private val jdbcTemplate: JdbcTemplate,
        private val transactionManager: PlatformTransactionManager
) {

    @Bean
    fun jpaSessionService() = JpaSessionService(jpaSessionRepository)

    @Bean
    fun localLockProvider() = JdbcLockProvider(jdbcTemplate, transactionManager)

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
