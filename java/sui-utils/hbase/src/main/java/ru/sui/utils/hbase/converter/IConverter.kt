package ru.sui.utils.hbase.converter

import ru.sui.utils.hbase.annotation.HBaseColConverter
import java.lang.reflect.Field
import kotlin.reflect.full.createInstance


interface IConverter<IN, OUT> {
    fun encode(from: IN): OUT
    fun decode(from: OUT): IN
}

/**
 * Use with common cols
 */
interface IByteArrayConverter<T : Any> : IConverter<T, ByteArray>

/**
 * Use with @HBaseVersionCol
 */
interface ILongConverter<T : Any> : IConverter<T, Long>

/**
 * Use with @Id col
 */
interface IStringConverter<T : Any> : IConverter<T, String>


@Suppress("UNCHECKED_CAST")
fun getConverter(field: Field): IConverter<Any, Any>? {
    return (field.declaredAnnotations
            .find { it is HBaseColConverter } as HBaseColConverter?)
            ?.value
            ?.createInstance() as IConverter<Any, Any>?
}
