package ru.sui.suisecurity.base.session

import java.util.*


interface SessionService {

    fun findById(id: UUID): Session?
    fun save(session: Session)
    fun findAllActive(): List<Session>
    fun findAllActiveByUserId(userId: Long): List<Session>
    fun findLastActivity(userId: Long): Session
}
