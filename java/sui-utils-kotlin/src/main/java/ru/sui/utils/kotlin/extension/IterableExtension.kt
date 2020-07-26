package ru.sui.utils.kotlin.extension

import java.util.*

fun <T : Enum<T>> Iterable<T>.toEnumSet(): EnumSet<T> = EnumSet.copyOf(this.toSet())

fun <A, B, R> Iterable<Pair<A, B>>.mapFirst(transform: (A) -> R) = map { transform(it.first) to it.second }
fun <A, B, R> Iterable<Pair<A, B>>.mapSecond(transform: (B) -> R) = map { it.first to transform(it.second) }

fun <T, R> Iterable<T>.mappingIterator(mapFunction: (T) -> R): Iterator<R> {
    val sourceIterator = this.iterator()

    return object : Iterator<R> {
        override fun hasNext() = sourceIterator.hasNext()
        override fun next() = mapFunction(sourceIterator.next())
    }
}
