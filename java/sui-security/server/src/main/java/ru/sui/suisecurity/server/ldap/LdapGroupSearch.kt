package ru.sui.suisecurity.server.ldap

import org.springframework.ldap.core.DirContextOperations

interface LdapGroupSearch {

    fun searchForGroups(userDn: String): List<DirContextOperations>

}