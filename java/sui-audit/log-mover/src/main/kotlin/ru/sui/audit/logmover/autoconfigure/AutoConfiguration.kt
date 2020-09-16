package ru.sui.audit.logmover.autoconfigure

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling


@Configuration
@ComponentScan("ru.sui.audit.logmover")
@EnableScheduling
class AutoConfiguration