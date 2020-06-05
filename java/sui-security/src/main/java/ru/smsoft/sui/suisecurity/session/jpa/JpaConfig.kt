package ru.smsoft.sui.suisecurity.session.jpa

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories


@Configuration
@ConditionalOnProperty(value = ["spring.redis.host"], matchIfMissing = true) // Костыль
@EntityScan("ru.smsoft.sui.suisecurity.session.jpa")
@EnableJpaRepositories("ru.smsoft.sui.suisecurity.session.jpa")
class JpaConfig(private val jpaSessionRepository: JpaSessionRepository) {

    @Bean
    fun jpaSessionService() = JpaSessionService(jpaSessionRepository)

}
