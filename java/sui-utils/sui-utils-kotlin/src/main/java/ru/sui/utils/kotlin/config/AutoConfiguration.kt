package ru.sui.utils.kotlin.config

import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration


@Configuration
@ComponentScan("ru.sui.utils.kotlin")
// Костыль, чтобы резолвить контекст в sui проектах
// Находится тут, т.к. sui-utils-kotlin есть во всех других sui-проектах
// Не влияет на работоспособность sui, т.к. EnableAutoConfiguration является частью SpringBootApplication
@EnableAutoConfiguration
class AutoConfiguration
