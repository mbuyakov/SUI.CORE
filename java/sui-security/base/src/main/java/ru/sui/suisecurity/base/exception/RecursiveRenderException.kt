package ru.sui.suisecurity.base.exception

import ru.sui.suientity.entity.suimeta.TableInfo
import ru.sui.suisecurity.base.utils.MetaSchemaUtils

class RecursiveRenderException(tableInfo: TableInfo) : RuntimeException(
        String.format(
        "Поле ссылки из другого объекта %s рекурсивно ссылается сам на себя (см. foreign_column_info)",
        MetaSchemaUtils.getFullTableInfoName(tableInfo))
)
