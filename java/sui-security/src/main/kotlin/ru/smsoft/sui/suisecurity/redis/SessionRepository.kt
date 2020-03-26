package ru.smsoft.sui.suisecurity.redis

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface SessionRepository : CrudRepository<Session, UUID>