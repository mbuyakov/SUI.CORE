package ru.sui.suisecurity.server.ldap

import org.springframework.ldap.core.DirContextOperations
import ru.sui.suientity.entity.suisecurity.User

interface LdapUserConverter {

    fun createOrUpdateLocalUser(user: DirContextOperations, groups: List<DirContextOperations>): User

}