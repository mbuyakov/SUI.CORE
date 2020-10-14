package ru.sui.suisecurity.base.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.hibernate5.Hibernate5Module
import com.fasterxml.jackson.module.kotlin.KotlinModule
import org.springframework.context.annotation.Configuration
import javax.annotation.PostConstruct


@Configuration("suiSecurityObjectMapperConfig")
class ObjectMapperConfig(val objectMapper: ObjectMapper) {

    @PostConstruct
    fun postConstruct() {
        objectMapper.registerModule(Hibernate5Module())
        objectMapper.registerModule(KotlinModule())
    }

}
