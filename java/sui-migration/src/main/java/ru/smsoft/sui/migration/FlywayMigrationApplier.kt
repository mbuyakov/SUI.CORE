package ru.smsoft.sui.migration

import org.flywaydb.core.Flyway
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct
import javax.sql.DataSource


@Service
class FlywayMigrationApplier(private val dataSource: DataSource) {

    @PostConstruct
    fun postConstruct() {
        val flyway = Flyway
                .configure()
                .dataSource(dataSource)
                .ignoreFutureMigrations(true)
                .baselineOnMigrate(true)
                .table("sui_flyway_schema_history")
                .locations("classpath:db/migration_sui")
                .load()

        flyway.migrate()
    }

}
