package ru.sui.suisecurity.server.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.ldap.AuthenticationException
import org.springframework.ldap.core.ContextMapper
import org.springframework.ldap.core.DirContextOperations
import org.springframework.ldap.core.support.LdapContextSource
import org.springframework.ldap.query.LdapQueryBuilder
import org.springframework.security.ldap.DefaultSpringSecurityContextSource
import org.springframework.security.ldap.SpringSecurityLdapTemplate
import ru.sui.suisecurity.server.ldap.LdapAuthenticationHelper

@Configuration
@ConditionalOnProperty("ldap.url")
class LdapConfiguration(
    @Value("\${ldap.url}") private val ldapUrl: String,
    @Value("\${ldap.manager-dn:#{null}}") private val ldapManagerDn: String?,
    @Value("\${ldap.manager-password:#{null}}") private val ldapManagerPassword: String?,
    @Value("\${ldap.root-dn:#{null}}") private val ldapRootDn: String?,
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
            ldapRootDn?.let { this.setBase(ldapRootDn) }
        }
    }

    @Bean
    fun ldapAuthenticationHelper(): LdapAuthenticationHelper {
        val ldapTemplate = SpringSecurityLdapTemplate(contextSource())

        return object : LdapAuthenticationHelper {

            @Suppress("LiftReturnOrAssignment")
            override fun authenticate(username: String, password: String): DirContextOperations? {
                if (ldapUserSearchFilter.isBlank()) {
                    return null
                }

                val query = LdapQueryBuilder.query()
                    .base(ldapUserSearchBase)
                    .filter(ldapUserSearchFilter, username)

                try {
                    ldapTemplate.authenticate(query, password)
                    return ldapTemplate.search(query, ContextMapper { it as DirContextOperations }).firstOrNull()
                } catch (exception: AuthenticationException) {
                    return null
                } catch (exception: EmptyResultDataAccessException) {
                    return null
                }
            }

            override fun searchForGroups(userDn: String): List<DirContextOperations> {
                if (ldapGroupSearchFilter.isBlank()) {
                    return emptyList()
                }

                val query = LdapQueryBuilder.query()
                    .base(ldapGroupSearchBase)
                    .filter(ldapGroupSearchFilter, userDn)

                return ldapTemplate.search(query, ContextMapper { it as DirContextOperations })
            }

        }
    }

}