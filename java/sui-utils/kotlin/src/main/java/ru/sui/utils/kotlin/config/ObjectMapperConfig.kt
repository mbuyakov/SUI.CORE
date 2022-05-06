package ru.sui.utils.kotlin.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.annotation.PostConstruct


@Configuration
class MissingObjectMapperConfig {

    @Bean
    @ConditionalOnMissingBean
    fun simpleObjectMapper() = ObjectMapper()

}

@Configuration
class KotlinObjectMapperConfig(private val objectMapper: ObjectMapper) {

    @PostConstruct
    fun postConstruct() {
        objectMapper.registerModule(KotlinModule.Builder().build())
    }

}
