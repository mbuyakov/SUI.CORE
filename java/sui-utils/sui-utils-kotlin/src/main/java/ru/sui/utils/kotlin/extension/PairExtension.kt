package ru.sui.utils.kotlin.extension


fun <A, B, C> Pair<A, B>.mapFirst(transform: (A) -> C) = transform(first) to second
fun <A, B, C> Pair<A, B>.mapSecond(transform: (B) -> C) = first to transform(second)
