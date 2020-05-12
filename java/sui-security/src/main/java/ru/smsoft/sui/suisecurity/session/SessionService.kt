package ru.smsoft.sui.suisecurity.session

import org.springframework.stereotype.Service
import java.util.*


@Service
interface SessionService {

    fun findById(id: UUID): Session?

    fun save(session: Session)

    fun findAllActiveByUserId(userId: Long): List<Session>

}
