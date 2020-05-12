package ru.smsoft.sui.suisecurity.session.jpa

import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories


@Configuration
@EntityScan("ru.smsoft.sui.suisecurity.session.jpa")
@EnableJpaRepositories("ru.smsoft.sui.suisecurity.session.jpa")
class JpaConfig
