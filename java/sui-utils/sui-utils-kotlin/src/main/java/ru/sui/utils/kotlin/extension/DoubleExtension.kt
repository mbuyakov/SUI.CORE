package ru.sui.utils.kotlin.extension

import java.math.BigDecimal
import java.math.RoundingMode

fun Double?.zeroSafeUnaryMinus(): Double? {
    return when (this) {
        null -> null
        0.0 -> 0.0
        else -> this.unaryMinus()
    }
}

fun Double?.isNotNullOrZero(): Boolean = this != null && this != 0.0

fun Double.normalize() = BigDecimal(this).setScale(7, RoundingMode.HALF_UP).toDouble()
