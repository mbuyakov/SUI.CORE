package ru.sui.suisecurity.base.lock

import org.springframework.dao.DuplicateKeyException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.TransactionDefinition
import org.springframework.transaction.TransactionStatus
import org.springframework.transaction.support.TransactionTemplate
import java.time.Duration
import java.util.*
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.Condition
import java.util.concurrent.locks.Lock


class JdbcLockProvider(
    private val jdbcTemplate: JdbcTemplate,
    transactionManager: PlatformTransactionManager
) : LockProvider {

    private val transactionTemplate = TransactionTemplate(transactionManager).apply {
        this.propagationBehavior = TransactionDefinition.PROPAGATION_REQUIRES_NEW
        this.isolationLevel = TransactionDefinition.ISOLATION_READ_COMMITTED
    }

    override fun get(group: String, key: String): Lock = JdbcLock(group, key, jdbcTemplate, transactionTemplate)

}

@Suppress("SqlNoDataSourceInspection", "SqlResolve")
private class JdbcLock(
    val group: String,
    val key: String,
    private val jdbcTemplate: JdbcTemplate,
    private val transactionTemplate: TransactionTemplate
) : Lock {

    override fun lock() {
        while (true) {
            try {
                executeInTransaction {
                    val now = Date()
                    val expireAt = Date(now.time + Duration.ofSeconds(10).toMillis())
                    jdbcTemplate.update("DELETE FROM sui_utils.lock WHERE expire_at <= ?", now)
                    jdbcTemplate.update("INSERT INTO sui_utils.lock(group_key, lock_key, expire_at) VALUES(?,?,?)", group, key, expireAt)
                }

                break
            } catch (exception: DuplicateKeyException) {
                Thread.sleep(25)
                // ignore
            }
        }
    }

    override fun unlock() {
        executeInTransaction {
            jdbcTemplate.update("DELETE FROM sui_utils.lock WHERE group_key = ? AND lock_key = ?", group, key)
        }
    }

    private fun executeInTransaction(action: (TransactionStatus) -> Unit) {
        transactionTemplate.execute {
            try {
                action(it)
            } catch (exception: Exception) {
                it.setRollbackOnly()
                throw exception
            }
        }
    }

    // Not implemented

    override fun tryLock(): Boolean = error("not implemented")
    override fun tryLock(time: Long, unit: TimeUnit): Boolean = error("not implemented")
    override fun lockInterruptibly(): Unit = error("not implemented")
    override fun newCondition(): Condition = error("not implemented")

}
