package ru.smsoft.sui.suisecurity.config

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Configuration
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories

@Configuration
@ConditionalOnProperty("spring.redis.host")
@EnableRedisRepositories("ru.smsoft.sui.suisecurity")
class RedisConfig