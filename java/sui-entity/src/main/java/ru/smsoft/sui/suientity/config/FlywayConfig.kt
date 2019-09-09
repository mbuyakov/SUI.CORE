package ru.smsoft.sui.suientity.config

import mu.KotlinLogging
import org.flywaydb.core.Flyway
import org.flywaydb.core.api.resolver.MigrationResolver
import org.flywaydb.core.internal.resolver.sql.SqlMigrationResolver
import org.springframework.beans.factory.config.BeanFactoryPostProcessor
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory
import org.springframework.boot.autoconfigure.AutoConfigureBefore
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration
import org.springframework.context.ApplicationContext
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.File
import java.util.jar.JarFile
import javax.persistence.EntityManagerFactory
import javax.sql.DataSource

@Configuration
@EnableAutoConfiguration(exclude = [FlywayAutoConfiguration::class])
@ConditionalOnProperty(prefix = "sui", name = ["enable-flyway"], matchIfMissing = true)
class FlywayConfig {
    @Bean
    fun flyway(dataSource: DataSource): Flyway{
        val flyway = Flyway.configure()
                .dataSource(dataSource)
                .ignoreFutureMigrations(true)
                .baselineOnMigrate(true)
                .table("sui_flyway_schema_history")
                .locations("classpath:db/migration_sui")
                .load()

        flyway.migrate()

        return flyway
    }
}
