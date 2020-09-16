package ru.sui.audit.manager.utils.trigger

sealed class TriggerEvent(protected val name: String): Fragment {

    override fun toString(): String = name

}

object InsertTriggerEvent : TriggerEvent("INSERT")
object DeleteTriggerEvent : TriggerEvent("DELETE")
object TruncateTriggerEvent : TriggerEvent("TRUNCATE")

class UpdateTriggerEvent(
        private val columns: List<String>? = null
): TriggerEvent("UPDATE") {

    override fun toString() = if (columns.isNullOrEmpty()) name else "$name OF ${columns.joinToString()}"

}
