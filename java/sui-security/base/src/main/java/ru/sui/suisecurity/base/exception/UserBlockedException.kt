package ru.sui.suisecurity.base.exception

import ru.sui.suientity.entity.suisecurity.User

class UserBlockedException(val user: User) : RuntimeException("Пользователь '${user.username}' заблокирован")
