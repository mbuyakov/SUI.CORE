package ru.sui.utils.hbase.converter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.apache.hadoop.hbase.util.Bytes
import ru.sui.utils.kotlin.extension.check
import java.lang.reflect.Field


private val OBJECT_MAPPER = ObjectMapper().registerKotlinModule()

class DefaultStringConverter<T : Any>(private val clazz: Class<T>) : IStringConverter<T> {
    override fun encode(from: T): String = OBJECT_MAPPER.writeValueAsString(from)
    override fun decode(from: String): T = OBJECT_MAPPER.readValue(from, clazz)
}

class StubStringConverter : IStringConverter<String> {
    override fun encode(from: String): String = from
    override fun decode(from: String): String = from
}

class ByteArrayStringConverter : IStringConverter<ByteArray> {
    override fun encode(from: ByteArray): String = Bytes.toString(from)
    override fun decode(from: String): ByteArray = Bytes.toBytes(from)
}

@Suppress("UNCHECKED_CAST")
fun getStringConverter(field: Field): IStringConverter<Any> {
    val converter = getConverter(field)?.check({ it is IStringConverter<Any> }, { "Can't get string converter for $field" })

    val fieldType = field.type
    return when {
        converter != null -> converter as IStringConverter<Any>
        fieldType == String::class.java -> StubStringConverter() as IStringConverter<Any>
        fieldType == ByteArray::class.java -> ByteArrayStringConverter() as IStringConverter<Any>
        else -> DefaultStringConverter(fieldType) as IStringConverter<Any>
    }
}
