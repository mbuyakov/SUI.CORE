package ru.sui.suisecurity.server.service

import org.springframework.ldap.core.DirContextOperations
import ru.sui.suientity.entity.suisecurity.User

interface LdapSupportService {

    fun checkPassword(rawPassword: String, user: DirContextOperations): Boolean

    fun createOrUpdateLocalUser(user: DirContextOperations, groups: List<DirContextOperations>): User

}