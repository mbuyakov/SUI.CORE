package ru.smsoft.sui.suisecurity.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.hibernate5.Hibernate5Module
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Configuration
class HibernateObjectMapperConfig(val objectMapper: ObjectMapper) {
    @PostConstruct
    fun postConstruct() {
        objectMapper.registerModule(Hibernate5Module())
    }
}