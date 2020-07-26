package ru.sui.audit.manager.utils.trigger

import ru.sui.audit.manager.extension.fullName
import ru.sui.suientity.entity.suimeta.TableInfo

class Trigger(
        private val name: String,
        private val triggerWhen: TriggerWhen,
        private val table: TableInfo,
        private val function: TriggerFunction,
        private val forEachType: TriggerForEachType = TriggerForEachType.ROW,
        private val events: List<TriggerEvent> = listOf(InsertTriggerEvent, UpdateTriggerEvent(), DeleteTriggerEvent),
        private val isConstraint: Boolean = false
) {

    fun createStatement() = """
        CREATE ${if (isConstraint) "CONSTRAINT" else ""} TRIGGER $name
            $triggerWhen ${events.joinToString(" OR ")}
            ON ${table.fullName()}
            FOR EACH $forEachType
            EXECUTE $function
    """.trimIndent()

    fun dropStatement(
            cascadeType: CascadeType = CascadeType.UNDEFINED,
            ifExists: Boolean = true
    ) = "DROP TRIGGER ${if (ifExists) "IF EXISTS" else ""} $name ON ${table.fullName()} $cascadeType".trimIndent()

}