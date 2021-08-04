package ru.sui.migration

import org.flywaydb.core.Flyway
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct


@Service
class FlywayMigrationApplier(private val jdbcTemplate: JdbcTemplate) {

    @Suppress("SqlDialectInspection", "SqlNoDataSourceInspection")
    @PostConstruct
    fun postConstruct() {
        jdbcTemplate.update("""
            UPDATE public.sui_flyway_schema_history
            SET checksum = -454516158
            WHERE version = 8 AND checksum != -454516158;
        """)

        val flyway = Flyway
                .configure()
                .dataSource(jdbcTemplate.dataSource)
                .ignoreFutureMigrations(true)
                .baselineOnMigrate(true)
                .table("sui_flyway_schema_history")
                .locations("classpath:db/migration_sui")
                .load()

        flyway.migrate()
    }

}
