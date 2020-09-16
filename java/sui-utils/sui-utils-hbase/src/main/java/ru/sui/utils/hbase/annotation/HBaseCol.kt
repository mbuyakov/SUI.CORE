package ru.sui.utils.hbase.annotation

import ru.sui.utils.hbase.repository.DEFAULT_COL_FAMILY


@Target(AnnotationTarget.FIELD)
@kotlin.annotation.Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
annotation class HBaseCol(val family: String = DEFAULT_COL_FAMILY, val name: String)
