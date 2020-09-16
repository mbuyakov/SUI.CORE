package ru.sui.suisecurity.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RequestMapping
import ru.sui.suientity.repository.suisecurity.UserRepository
import ru.sui.suisecurity.exception.ResourceNotFoundException
import ru.sui.suisecurity.utils.LOAD_USER_BY_ID_CACHE
import ru.sui.suisecurity.utils.LOAD_USER_BY_USERNAME_CACHE


@Service
@RequestMapping
class CustomUserDetailsService : UserDetailsService {

    @Autowired
    private lateinit var userRepository: UserRepository

    @Cacheable(LOAD_USER_BY_USERNAME_CACHE)
    override fun loadUserByUsername(usernameOrEmail: String): UserDetails {
        return userRepository
                .findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElse(null)
                ?.let { UserPrincipal(it) }
                ?: throw UsernameNotFoundException("User not found with username or email : $usernameOrEmail")
    }

    @Cacheable(LOAD_USER_BY_ID_CACHE)
    fun loadUserById(id: Long): UserDetails {
        return userRepository
                .findById(id)
                .orElse(null)
                ?.let { UserPrincipal(it) }
                ?: throw ResourceNotFoundException("User", "id", id)
    }

}
