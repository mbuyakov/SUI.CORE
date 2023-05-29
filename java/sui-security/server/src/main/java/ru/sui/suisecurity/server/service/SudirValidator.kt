package ru.sui.suisecurity.server.service

import ru.sui.suientity.entity.suisecurity.User

interface SudirValidator {

    // throw error if not valid
    @Throws(Exception::class)
    fun validate(user: User, teResponse: TeResponse, meResponse: MeResponse)

}