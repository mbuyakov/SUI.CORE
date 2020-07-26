package ru.sui.audit.manager.utils.trigger

class TriggerFunction(
        private val schema: String,
        private val name: String,
        private val args: List<String> = emptyList()
): Fragment {

    override fun toString() = "$schema.$name(${args.joinToString { "'${it}'" }})"

}