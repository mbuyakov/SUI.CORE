package ru.smsoft.sui.suisecurity.session.redis

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories

@Configuration
@ConditionalOnProperty("spring.redis.host")
@EnableRedisRepositories("ru.smsoft.sui.suisecurity.session.redis")
class RedisConfig(private val redisSessionRepository: RedisSessionRepository) {

    @Bean
    @Primary
    fun redisSessionService() = RedisSessionService(redisSessionRepository)

}