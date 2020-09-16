package ru.sui.utils.hbase.converter

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.apache.hadoop.hbase.util.Bytes
import ru.sui.utils.kotlin.extension.deserialize
import ru.sui.utils.kotlin.extension.serialize
import java.io.Serializable
import java.lang.reflect.Field
import java.lang.reflect.ParameterizedType


private val OBJECT_MAPPER = ObjectMapper().registerKotlinModule()

class DefaultByteArrayConverter<T : Any>(private val clazz: Class<T>) : IByteArrayConverter<T> {
    override fun encode(from: T): ByteArray = OBJECT_MAPPER.writeValueAsBytes(from)
    override fun decode(from: ByteArray): T = OBJECT_MAPPER.readValue(from, clazz)
}

class StubByteArrayConverter : IByteArrayConverter<ByteArray> {
    override fun encode(from: ByteArray): ByteArray = from
    override fun decode(from: ByteArray): ByteArray = from
}

class ListByteArrayConverter(val field: Field) : IByteArrayConverter<List<Any>> {
    private val genericClass = (field.genericType as ParameterizedType).actualTypeArguments[0] as Class<*>

    override fun encode(from: List<Any>): ByteArray = OBJECT_MAPPER.writeValueAsBytes(from)
    override fun decode(from: ByteArray): List<Any> = OBJECT_MAPPER.readValue(from, OBJECT_MAPPER.typeFactory.constructCollectionType(List::class.java, genericClass))
}

class SerializableByteArrayConverter(val clazz: Class<Serializable>) : IByteArrayConverter<Serializable> {
    override fun encode(from: Serializable): ByteArray = from.serialize()
    override fun decode(from: ByteArray): Serializable = clazz.deserialize(from)
}

class StringByteArrayConverter : IByteArrayConverter<String> {
    override fun encode(from: String): ByteArray = Bytes.toBytes(from)
    override fun decode(from: ByteArray): String = Bytes.toString(from)
}

class JsonNodeByteArrayConverter : IByteArrayConverter<JsonNode> {
    override fun encode(from: JsonNode): ByteArray = OBJECT_MAPPER.writeValueAsBytes(from)
    override fun decode(from: ByteArray): JsonNode = OBJECT_MAPPER.readTree(from)
}

private class StringConverterWrapper<T: Any>(private val stringConverter: IStringConverter<T>): IByteArrayConverter<T> {

    private val stringByteArrayConverter = StringByteArrayConverter()

    override fun encode(from: T) = stringByteArrayConverter.encode(stringConverter.encode(from))

    override fun decode(from: ByteArray) = stringConverter.decode(stringByteArrayConverter.decode(from))

}

@Suppress("UNCHECKED_CAST")
fun getByteArrayConverter(field: Field): IByteArrayConverter<Any> {
    val converter = getConverter(field)

    val fieldType = field.type

    return when {
        converter is IByteArrayConverter<Any> -> converter
        converter is IStringConverter<Any> -> StringConverterWrapper(converter)
        converter != null -> error("Can't get byte array converter for $field")
        fieldType == List::class.java -> ListByteArrayConverter(field) as IByteArrayConverter<Any>
        fieldType == ByteArray::class.java -> StubByteArrayConverter() as IByteArrayConverter<Any>
        fieldType == String::class.java -> StringByteArrayConverter() as IByteArrayConverter<Any>
        JsonNode::class.java.isAssignableFrom(fieldType) -> JsonNodeByteArrayConverter() as IByteArrayConverter<Any>
        fieldType.interfaces.contains(Serializable::class.java) -> SerializableByteArrayConverter(fieldType as Class<Serializable>) as IByteArrayConverter<Any>
        else -> DefaultByteArrayConverter(fieldType) as IByteArrayConverter<Any>
    }
}
