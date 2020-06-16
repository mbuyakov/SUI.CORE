package ru.sui.suientity.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@ComponentScan(basePackages = "ru.sui.suientity")
@EntityScan("ru.sui.suientity.entity")
@EnableJpaRepositories("ru.sui.suientity.repository")
@EnableJpaAuditing
@EnableCaching
@Configuration
public class Autoconfiguration {}
