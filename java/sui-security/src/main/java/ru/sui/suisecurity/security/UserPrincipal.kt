package ru.sui.suisecurity.security

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import ru.sui.suientity.entity.suisecurity.User
import java.util.*

class UserPrincipal(
        val user: User,
        private val authorities: Collection<GrantedAuthority> = user.roles.map { role -> SimpleGrantedAuthority(role.name) }
) : UserDetails {

    @Deprecated("Use user getter", ReplaceWith("user"))
    fun toUser() = user

    override fun getUsername(): String = user.username
    override fun getPassword(): String = user.password
    override fun getAuthorities(): Collection<GrantedAuthority> = authorities
    override fun isAccountNonExpired() = true
    override fun isAccountNonLocked() = true
    override fun isCredentialsNonExpired() = true
    override fun isEnabled() = !user.deleted

    override fun equals(other: Any?) = this.user.id == (other as UserPrincipal?)?.user?.id

    override fun hashCode() = Objects.hash(user.id)

    companion object {
        @JvmStatic
        @Deprecated("Use constructor", ReplaceWith("UserPrincipal(user)", "ru.sui.suisecurity.security.UserPrincipal"))
        fun fromUser(user: User) = UserPrincipal(user)
    }

}
