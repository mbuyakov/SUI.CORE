package ru.smsoft.sui.suisecurity.session

import java.util.*

class Session internal constructor(
    val id: UUID,
    val userId: Long,
    val expiryDate: Date,
    var lastUserActivity: Date,
    active: Boolean,
    disablingDate: Date? = null
) {

    var active = active
        private set
    var disablingDate = disablingDate
        private set

    constructor(id: UUID, userId: Long, expiryDate: Date) : this(
        id = id,
        userId = userId,
        expiryDate = expiryDate,
        active = true,
        lastUserActivity = Date()
    )

    fun disable() {
        this.active = false
        this.disablingDate = Date()
    }

    fun isValid(activityThreshold: Long) : Boolean {
        val now = Date()

        return this.active
                && this.expiryDate < now
                && (now.time - lastUserActivity.time) <= activityThreshold
    }

}
