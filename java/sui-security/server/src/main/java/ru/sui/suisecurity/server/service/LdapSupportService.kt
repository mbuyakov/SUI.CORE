package ru.sui.suisecurity.server.service

import org.springframework.ldap.core.DirContextOperations
import ru.sui.suientity.entity.suisecurity.User

interface LdapSupportService {

    fun checkPassword(rawPassword: String, searchResult: DirContextOperations): Boolean

    fun createOrUpdateLocalUser(searchResult: DirContextOperations): User

}