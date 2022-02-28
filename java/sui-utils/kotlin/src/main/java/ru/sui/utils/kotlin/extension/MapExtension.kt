package ru.sui.utils.kotlin.extension


@Suppress("UNCHECKED_CAST")
fun <K, V> Map<K?, V>.filterNotNullKeys(): Map<K, V> = this.filterKeys { it != null } as Map<K, V>

@Suppress("UNCHECKED_CAST")
fun <K, V> Map<K, V?>.filterNotNullValues(): Map<K, V> = this.filterValues { it != null } as Map<K, V>
