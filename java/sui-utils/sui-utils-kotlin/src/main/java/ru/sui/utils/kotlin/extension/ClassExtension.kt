package ru.sui.utils.kotlin.extension

import java.lang.reflect.Field

fun <T> Class<T>.getAccessibleDeclaredField(fieldName: String): Field = this.getDeclaredField(fieldName).apply { this.isAccessible = true }
