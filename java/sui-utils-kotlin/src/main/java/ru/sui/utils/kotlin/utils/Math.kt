package ru.sui.utils.kotlin.utils

fun hypot(a: Number?, b: Number?): Double? = if (a != null && b != null) kotlin.math.hypot(a.toDouble(), b.toDouble()) else null
