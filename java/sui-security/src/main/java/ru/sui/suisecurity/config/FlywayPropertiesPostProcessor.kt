package ru.sui.suisecurity.config

import mu.KotlinLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration
import org.springframework.boot.autoconfigure.flyway.FlywayProperties
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
@EnableAutoConfiguration(exclude = [FlywayAutoConfiguration::class])
@ConditionalOnProperty(prefix = "sui", name = ["enable-flyway"], matchIfMissing = true)
class FlywayPropertiesPostProcessor: BeanPostProcessor {
  private val log = KotlinLogging.logger {  }

  @Autowired
  private lateinit var dataSource: DataSource


  override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
    if (bean is FlywayProperties) {
      bean.table = "sui_flyway_schema_history"
      log.info { "Flyway table succesfulu changed to \"sui_flyway_schema_history\"" }
    }
    return bean
  }
}
