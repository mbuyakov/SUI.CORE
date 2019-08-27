package ru.smsoft.sui.suientity.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@EntityScan("ru.smsoft.sui.suientity.entity")
@EnableJpaRepositories("ru.smsoft.sui.suientity.repository")
@EnableJpaAuditing
public class Autoconfiguration {}