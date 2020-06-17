package ru.sui.migration

import org.springframework.boot.autoconfigure.AutoConfigurationImportFilter
import org.springframework.boot.autoconfigure.AutoConfigurationMetadata
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration

class SuiMigrationAutoConfigurationImportFilter : AutoConfigurationImportFilter {

  override fun match(
    autoConfigurationClasses: Array<String>,
    autoConfigurationMetadata: AutoConfigurationMetadata
  ): BooleanArray {
    return autoConfigurationClasses.map { it != FlywayAutoConfiguration::class.qualifiedName }.toBooleanArray()
  }
}
