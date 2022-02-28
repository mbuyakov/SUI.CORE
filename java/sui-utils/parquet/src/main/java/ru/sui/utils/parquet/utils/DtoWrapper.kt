package ru.sui.utils.parquet.utils

import org.apache.parquet.example.data.Group
import org.apache.parquet.example.data.simple.SimpleGroupFactory
import org.apache.parquet.schema.*
import ru.sui.utils.kotlin.annotation.Parent
import java.lang.reflect.Field
import java.lang.reflect.Modifier
import java.lang.reflect.ParameterizedType
import java.util.*
import javax.annotation.Nullable


@Target(AnnotationTarget.FIELD)
annotation class Directory

class DtoFieldWrapper(val f: Field) {

    private val isNullable = f.isAnnotationPresent(Nullable::class.java)
    private var isGroup = false
    private var isList = false
    private val repetition = if (isNullable) Type.Repetition.OPTIONAL else Type.Repetition.REQUIRED
    private val originalType: OriginalType?
    private val primitiveType: PrimitiveType.PrimitiveTypeName?
    private var childrenDtoWrapper: DtoWrapper<Any>? = null
    private var childrenFields: List<Type>? = null
    private var addToGroupFn: (group: Group, value: Any) -> Unit


    init {
        f.isAccessible = true
        when {
            String::class.java.isAssignableFrom(f.type) || java.lang.String::class.java.isAssignableFrom(f.type) -> {
                primitiveType = PrimitiveType.PrimitiveTypeName.BINARY
                originalType = OriginalType.UTF8
                addToGroupFn = { group: Group, value: Any -> group.add(f.name, value as String) }
            }
            Long::class.java.isAssignableFrom(f.type) || java.lang.Long::class.java.isAssignableFrom(f.type) || f.type.name == "long" -> {
                primitiveType = PrimitiveType.PrimitiveTypeName.INT64
                originalType = null
                addToGroupFn = { group: Group, value: Any -> group.add(f.name, value as Long) }
            }
            Int::class.java.isAssignableFrom(f.type) || Integer::class.java.isAssignableFrom(f.type) || f.type.name == "int" -> {
                primitiveType = PrimitiveType.PrimitiveTypeName.INT32
                originalType = null
                addToGroupFn = { group: Group, value: Any -> group.add(f.name, value as Int) }
            }
            Double::class.java.isAssignableFrom(f.type) || java.lang.Double::class.java.isAssignableFrom(f.type) || f.type.name == "double" -> {
                primitiveType = PrimitiveType.PrimitiveTypeName.DOUBLE
                originalType = null
                addToGroupFn = { group: Group, value: Any -> group.add(f.name, value as Double) }
            }
            Boolean::class.java.isAssignableFrom(f.type) || java.lang.Boolean::class.java.isAssignableFrom(f.type) || f.type.name == "boolean" -> {
                primitiveType = PrimitiveType.PrimitiveTypeName.BOOLEAN
                originalType = null
                addToGroupFn = { group: Group, value: Any -> group.add(f.name, value as Boolean) }
            }
            Date::class.java.isAssignableFrom(f.type) || Calendar::class.java.isAssignableFrom(f.type) -> {
                primitiveType = PrimitiveType.PrimitiveTypeName.INT64
                originalType = OriginalType.TIMESTAMP_MILLIS
                addToGroupFn = if (Date::class.java.isAssignableFrom(f.type)) {
                    { group: Group, value: Any -> group.add(f.name, (value as Date).time) }
                } else {
                    { group: Group, value: Any -> group.add(f.name, (value as Calendar).timeInMillis) }
                }
            }
            List::class.java.isAssignableFrom(f.type) -> {
                primitiveType = null
                originalType = null
                isList = true
                val genericClass = (f.genericType as ParameterizedType).actualTypeArguments[0] as Class<*>
                childrenDtoWrapper = DtoWrapper(genericClass) as DtoWrapper<Any>
                addToGroupFn = { group: Group, value: Any ->
                    val repetitionCount = group.getFieldRepetitionCount(f.name)
                    if(repetitionCount == 0) {
                        group.addGroup(f.name).addGroup("list")
                    }
                    val listGroup = group.getGroup(f.name, 0).getGroup("list", 0)
                    (value as List<Any>).forEach {
                        listGroup.add("element", childrenDtoWrapper!!.toGroup(it))
                    }
                }
            }
            else -> {
                primitiveType = null
                originalType = null
                isGroup = true
                childrenDtoWrapper = DtoWrapper(f.type) as DtoWrapper<Any>
                addToGroupFn = { group: Group, value: Any ->
                    group.add(f.name, childrenDtoWrapper!!.toGroup(value))
                }
            }
        }
        childrenFields = childrenDtoWrapper?.fields?.map { it.toSchemaType() }

    }

    fun toSchemaType(): Type = when {
        isList -> Types.list(repetition).setElementType(Types.buildGroup(repetition).addFields(*(childrenFields!!.toTypedArray())).named("element"))
        isGroup -> Types.buildGroup(repetition).addFields(*(childrenFields!!.toTypedArray()))
        else -> Types.primitive(primitiveType, repetition)
    }
            .`as`(originalType)
            .named(f.name) as Type

    fun addToGroup(group: Group, obj: Any) {
        val value = f.get(obj)
        if (value != null) {
            addToGroupFn(group, value)
        }
    }
}

class DtoWrapper<T: Any>(private val clazz: Class<T>, directoryFields: List<String>? = null) {

    private val _directoryFields = directoryFields ?: clazz.declaredFields.filter { it.isAnnotationPresent(Directory::class.java) }
    val directoryFields = clazz.declaredFields.filter { shouldCreateDtoWrapper(it) && _directoryFields.contains(it.name) }.map { DtoFieldWrapper(it) }
    val fields = clazz.declaredFields.filter { shouldCreateDtoWrapper(it) && !_directoryFields.contains(it.name) }.map { DtoFieldWrapper(it) }
    val schema = MessageType(clazz.simpleName, fields.map { it.toSchemaType() })

    fun toGroup(obj: T): Group {
        val group = SimpleGroupFactory(schema).newGroup()
        fields.forEach { it.addToGroup(group, obj) }
        return group
    }

    private fun shouldCreateDtoWrapper(field: Field): Boolean {
        return field.name != "serialVersionUID"
                && !Modifier.isFinal(field.modifiers)
                && !Modifier.isStatic(field.modifiers)
                && !field.isAnnotationPresent(Parent::class.java)
    }

}
