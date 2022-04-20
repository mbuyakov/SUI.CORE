package ru.sui.suisecurity.server.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.ldap.core.ContextMapper
import org.springframework.ldap.core.DirContextOperations
import org.springframework.ldap.core.support.LdapContextSource
import org.springframework.ldap.query.LdapQueryBuilder
import org.springframework.security.ldap.DefaultSpringSecurityContextSource
import org.springframework.security.ldap.SpringSecurityLdapTemplate
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch
import org.springframework.security.ldap.search.LdapUserSearch
import ru.sui.suisecurity.server.ldap.LdapGroupSearch

@Configuration
@ConditionalOnProperty("ldap.url")
class LdapConfiguration(
    @Value("\${ldap.url}") private val ldapUrl: String,
    @Value("\${ldap.manager-dn:#{null}}") private val ldapManagerDn: String?,
    @Value("\${ldap.manager-password:#{null}}") private val ldapManagerPassword: String?,
    @Value("\${ldap.user-search-base:}") private val ldapUserSearchBase: String,
    @Value("\${ldap.user-search-filter}") private val ldapUserSearchFilter: String,
    @Value("\${ldap.group-search-base:}") private val ldapGroupSearchBase: String,
    @Value("\${ldap.group-search-filter}") private val ldapGroupSearchFilter: String
) {

    @Bean
    fun contextSource(): LdapContextSource {
        return DefaultSpringSecurityContextSource(ldapUrl).apply {
            ldapManagerDn?.let { this.userDn = it }
            ldapManagerPassword?.let { this.password = it }
        }
    }

    @Bean
    fun ldapUserSearch(): LdapUserSearch {
        return FilterBasedLdapUserSearch(ldapUserSearchBase, ldapUserSearchFilter, contextSource())
    }

    @Bean
    fun ldapGroupSearch(): LdapGroupSearch {
        val ldapTemplate = SpringSecurityLdapTemplate(contextSource())
        return object : LdapGroupSearch {
            override fun searchForGroups(userDn: String): List<DirContextOperations> {
                val query = LdapQueryBuilder.query()
                    .base(ldapGroupSearchBase)
                    .filter(ldapGroupSearchFilter, userDn)

                return ldapTemplate.search(query, ContextMapper { it as DirContextOperations })
            }
        }
    }

}