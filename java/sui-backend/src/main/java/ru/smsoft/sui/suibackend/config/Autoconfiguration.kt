package ru.smsoft.sui.suibackend.config

import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.core.Ordered
import org.springframework.transaction.annotation.EnableTransactionManagement

@Configuration
@EnableTransactionManagement(order = Ordered.LOWEST_PRECEDENCE - 1)
@ComponentScan("ru.smsoft.sui.suibackend")
class Autoconfiguration
