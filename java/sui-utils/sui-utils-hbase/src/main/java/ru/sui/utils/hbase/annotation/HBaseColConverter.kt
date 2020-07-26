package ru.sui.utils.hbase.annotation

import ru.sui.utils.hbase.converter.IConverter
import kotlin.reflect.KClass


/**
 * @see ru.sui.utils.hbase.converter.IByteArrayConverter
 * @see ru.sui.utils.hbase.converter.ILongConverter
 * @see ru.sui.utils.hbase.converter.IStringConverter
 */
@Target(AnnotationTarget.FIELD)
@kotlin.annotation.Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
annotation class HBaseColConverter(val value: KClass<out IConverter<*, *>>)
