package ru.sui.audit.manager.utils.trigger

enum class TriggerWhen(private val sql: String): Fragment {

    BEFORE("BEFORE"),
    AFTER("AFTER"),
    INSTEAD_OF("INSTEAD OF");

    override fun toString() = sql

}