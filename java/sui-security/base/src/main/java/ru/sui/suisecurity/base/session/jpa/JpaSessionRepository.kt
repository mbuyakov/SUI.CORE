package ru.sui.suisecurity.base.session.jpa

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*


@Repository
interface JpaSessionRepository : JpaRepository<JpaSession, UUID> {

  fun findAllByActiveIsTrue(): List<JpaSession>

  fun findAllByActiveIsTrueAndUserId(userId: Long): List<JpaSession>
  fun findByUserId(userId: Long): List<JpaSession>
}
