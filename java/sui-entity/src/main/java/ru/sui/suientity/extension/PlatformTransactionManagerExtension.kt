package ru.sui.suientity.extension

import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW
import org.springframework.transaction.support.DefaultTransactionDefinition
import org.springframework.transaction.support.TransactionTemplate


fun PlatformTransactionManager.template(propagationBehavior: Int = PROPAGATION_REQUIRES_NEW): TransactionTemplate {
    return TransactionTemplate(this, DefaultTransactionDefinition(propagationBehavior))
}
