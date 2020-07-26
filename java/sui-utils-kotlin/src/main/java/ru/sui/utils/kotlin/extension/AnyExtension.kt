package ru.sui.utils.kotlin.extension

import ru.sui.utils.kotlin.annotation.Parent
import java.util.*


// Replace a?.let { ... } ?: "" to a.letOrEmpty { ... }
inline fun <T> T?.letOrEmpty(block: (T) -> String) = this?.let(block) ?: ""

fun <T> T?.toOptional(): Optional<T> = Optional.ofNullable(this)

fun <T> T.check(predicate: (T) -> Boolean, lazyMessage: () -> String): T = apply { check(predicate(this), lazyMessage) }

fun <T> T?.orElse(defaultValue: T) = this ?: defaultValue

fun <T : Any> T.setParents(classFilter: (Class<*>) -> Boolean = { true }) : T {
    setParentRefs(this, null, classFilter)
    return this
}

private fun setParentRefs(obj: Any?, parent: Any?, classFilter: (Class<*>) -> Boolean) {
    if (obj != null) {
        val objClass = obj.javaClass

        if (classFilter(objClass)) {
            objClass.declaredFields.forEach { field ->
                field.isAccessible = true

                if (field.isAnnotationPresent(Parent::class.java)) {
                    field.set(obj, parent)
                } else {
                    val type = field.type

                    if (Collection::class.java.isAssignableFrom(type)) {
                        (field.get(obj) as Collection<*>?)?.forEach { setParentRefs(it, obj, classFilter) }
                    } else {
                        setParentRefs(field.get(obj), obj, classFilter)
                    }
                }
            }
        }
    }
}
