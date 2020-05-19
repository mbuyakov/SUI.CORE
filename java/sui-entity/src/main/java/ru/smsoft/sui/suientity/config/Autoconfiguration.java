package ru.smsoft.sui.suientity.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@ComponentScan(basePackages = "ru.smsoft.sui.suientity")
@EntityScan("ru.smsoft.sui.suientity.entity")
@EnableJpaRepositories("ru.smsoft.sui.suientity.repository")
@EnableJpaAuditing
@EnableCaching
@Configuration
public class Autoconfiguration {}
