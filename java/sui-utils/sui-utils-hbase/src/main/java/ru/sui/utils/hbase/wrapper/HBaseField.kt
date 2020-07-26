package ru.sui.utils.hbase.wrapper

import ru.sui.utils.hbase.annotation.HBaseCol
import ru.sui.utils.hbase.converter.*
import ru.sui.utils.hbase.repository.DEFAULT_COL_FAMILY
import java.lang.reflect.Field


class HBaseField(val field: Field) {
    val longConverter: ILongConverter<Any> by lazy { getLongConverter(field) }
    val stringConverter: IStringConverter<Any> = getStringConverter(field)
    val byteArrayConverter: IByteArrayConverter<Any> = getByteArrayConverter(field)
    val col: HBaseColDesc

    init {
        val hBaseCol = field.getAnnotation(HBaseCol::class.java)
        col = hBaseCol?.let { HBaseColDesc(it.family, it.name) } ?: HBaseColDesc(DEFAULT_COL_FAMILY, field.name)
    }

    @Suppress("UNCHECKED_CAST")
    fun <T> convertAndSet(obj: Any, value: T?, converter: IConverter<Any, T> = byteArrayConverter as IConverter<Any, T>) = field.set(obj, value?.let { converter.decode(it) })

    @Suppress("UNCHECKED_CAST")
    fun <T> getAndConvert(obj: Any, converter: IConverter<Any, T> = byteArrayConverter as IConverter<Any, T>) = field.get(obj)?.let { converter.encode(it) }

    fun get(obj: Any) = field.get(obj)
    fun set(obj: Any, value: Any) = field.set(obj, value)
}
