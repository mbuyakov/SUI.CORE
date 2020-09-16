package ru.sui.audit.manager.extension

import ru.sui.suientity.entity.suimeta.TableInfo


// Временный костыль (может поломаться при добавлении новых engine)
fun TableInfo.fullName() = "${this.schemaName}.${this.name}"