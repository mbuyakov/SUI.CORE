package ru.smsoft.sui.suisecurity.session

import java.util.*


interface SessionService {

    fun findById(id: UUID): Session?

    fun save(session: Session)

    fun findAllActive(): List<Session>

    fun findAllActiveByUserId(userId: Long): List<Session>

}
