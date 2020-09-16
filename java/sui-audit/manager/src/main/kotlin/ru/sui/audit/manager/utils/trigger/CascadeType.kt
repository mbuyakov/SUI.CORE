package ru.sui.audit.manager.utils.trigger

enum class CascadeType(private val sql: String): Fragment {

    CASCADE("CASCADE"),
    RESTRICT("RESTRICT"),
    UNDEFINED("");

    override fun toString() = sql

}
