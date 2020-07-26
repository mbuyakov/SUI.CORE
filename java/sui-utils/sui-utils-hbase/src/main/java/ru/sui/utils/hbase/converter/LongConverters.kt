package ru.sui.utils.hbase.converter

import ru.sui.utils.kotlin.extension.check
import java.lang.reflect.Field
import java.sql.Timestamp
import java.util.*


class StubLongConverter: ILongConverter<Long> {
    override fun encode(from: Long): Long = from
    override fun decode(from: Long): Long = from
}

class DateLongConverter: ILongConverter<Date> {
    override fun encode(from: Date): Long = from.time
    override fun decode(from: Long): Date = Date(from)
}

class SqlDateLongConverter: ILongConverter<java.sql.Date> {
    override fun encode(from: java.sql.Date): Long = from.time
    override fun decode(from: Long): java.sql.Date = java.sql.Date(from)
}

class TimestampLongConverter: ILongConverter<Timestamp> {
    override fun encode(from: Timestamp): Long = from.time
    override fun decode(from: Long): Timestamp = Timestamp(from)
}

@Suppress("UNCHECKED_CAST")
fun getLongConverter(field: Field): ILongConverter<Any> {
    val converter = getConverter(field)?.check({ it is ILongConverter<Any> }, { "Can't get long converter for $field" })

    val fieldType = field.type
    return when {
        converter != null -> converter as ILongConverter<Any>
        fieldType == Long::class.java -> StubLongConverter() as ILongConverter<Any>
        fieldType == Date::class.java -> DateLongConverter() as ILongConverter<Any>
        fieldType == java.sql.Date::class.java -> SqlDateLongConverter() as ILongConverter<Any>
        fieldType == Timestamp::class.java -> TimestampLongConverter() as ILongConverter<Any>
        else -> error("Long converter not found")
    }
}
