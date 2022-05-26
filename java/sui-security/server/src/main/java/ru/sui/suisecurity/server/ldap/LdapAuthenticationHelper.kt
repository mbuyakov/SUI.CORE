package ru.sui.suisecurity.server.ldap

import org.springframework.ldap.core.DirContextOperations

interface LdapAuthenticationHelper {

    fun authenticate(username: String, password: String): DirContextOperations?

    fun searchForGroups(userDn: String): List<DirContextOperations>

}