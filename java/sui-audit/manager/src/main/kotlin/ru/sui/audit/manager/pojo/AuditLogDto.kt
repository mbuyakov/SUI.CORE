package ru.sui.audit.manager.pojo

import com.fasterxml.jackson.databind.node.ObjectNode

class AuditLogDto(
        val rowId: String,
        val operationType: String,
        val userId: Long?,
        val dbUser: String,
        val created: String,
        val content: ObjectNode
)