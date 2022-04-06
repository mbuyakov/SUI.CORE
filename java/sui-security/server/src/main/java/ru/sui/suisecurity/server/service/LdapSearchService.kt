package ru.sui.suisecurity.server.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.ldap.core.DirContextOperations
import org.springframework.security.ldap.DefaultSpringSecurityContextSource
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch
import org.springframework.stereotype.Service

@Service
@ConditionalOnProperty("ldap.url")
class LdapSearchService(
    @Value("\${ldap.url}") private val ldapUrl: String,
    @Value("\${ldap.manager-dn:#{null}}") private val ldapManagerDn: String?,
    @Value("\${ldap.manager-password:#{null}}") private val ldapManagerPassword: String?,
    @Value("\${ldap.user-search-base:}}") private val ldapUserSearchBase: String,
    @Value("\${ldap.user-search-filter}") private val userSearchFilter: String
) {

    private val userSearch = FilterBasedLdapUserSearch(
        ldapUserSearchBase ,
        userSearchFilter,
        DefaultSpringSecurityContextSource(ldapUrl).apply {
            ldapManagerDn?.let { this.userDn = it }
            ldapManagerPassword?.let { this.password = it }
        }
    )

    fun searchUser(username: String): DirContextOperations {
        return userSearch.searchForUser(username)
    }

}