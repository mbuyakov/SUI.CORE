package ru.sui.audit.manager.extension

import org.springframework.jdbc.core.JdbcTemplate
import ru.sui.audit.manager.utils.trigger.CascadeType
import ru.sui.audit.manager.utils.trigger.Trigger


fun Trigger.drop(
        queryExecutor: (String) -> Unit,
        cascadeType: CascadeType = CascadeType.UNDEFINED,
        ifExists: Boolean = true
) {
    queryExecutor(this.dropStatement(cascadeType, ifExists))
}

fun Trigger.drop(
        jdbcTemplate: JdbcTemplate,
        cascadeType: CascadeType = CascadeType.UNDEFINED,
        ifExists: Boolean = true
) {
    this.drop(jdbcTemplate::execute, cascadeType, ifExists)
}

fun Trigger.recreate(queryExecutor: (String) -> Unit, cascadeType: CascadeType = CascadeType.UNDEFINED) {
    this.drop(queryExecutor, cascadeType)
    queryExecutor(this.createStatement())
}

fun Trigger.recreate(jdbcTemplate: JdbcTemplate, cascadeType: CascadeType = CascadeType.UNDEFINED) {
    this.recreate(jdbcTemplate::execute, cascadeType)
}