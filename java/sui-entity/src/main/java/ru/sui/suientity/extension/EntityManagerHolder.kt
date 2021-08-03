package ru.sui.suientity.extension

import org.springframework.stereotype.Component
import javax.persistence.EntityManager

@Component
class EntityManagerHolder(entityManager: EntityManager) {

    init {
        INSTANCE = entityManager
    }

    companion object {
        var INSTANCE: EntityManager? = null
    }

}
