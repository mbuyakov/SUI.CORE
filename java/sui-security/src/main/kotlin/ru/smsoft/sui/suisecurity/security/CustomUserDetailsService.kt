package ru.smsoft.sui.suisecurity.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.util.Pair
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RequestMapping
import ru.smsoft.sui.suientity.entity.suisecurity.User
import ru.smsoft.sui.suientity.repository.suisecurity.UserRepository
import ru.smsoft.sui.suisecurity.exception.ResourceNotFoundException
import ru.smsoft.sui.suisecurity.utils.TimeCache
import java.util.function.Supplier

private const val CACHE_ACTUAL_MILLIS: Long = 15000

@Service
@RequestMapping
class CustomUserDetailsService : UserDetailsService {

    @Autowired
    private lateinit var userRepository: UserRepository

    private val userCache = TimeCache<Pair<UserIdentifierType, Any>, User>(CACHE_ACTUAL_MILLIS)

    private enum class UserIdentifierType {
        ID,
        USERNAME_OR_EMAIL
    }

    override fun loadUserByUsername(usernameOrEmail: String): UserDetails {
        return loadUser(
                UserIdentifierType.USERNAME_OR_EMAIL,
                usernameOrEmail,
                Supplier { userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail).orElse(null) },
                UsernameNotFoundException("User not found with username or email : $usernameOrEmail"))
    }

    fun loadUserById(id: Long): UserDetails {
        return loadUser(
                UserIdentifierType.ID,
                id,
                Supplier { userRepository.findById(id).orElse(null) },
               ResourceNotFoundException("User", "id", id))
    }

    private fun loadUser(
            type: UserIdentifierType,
            identifier: Any,
            loader: Supplier<User?>,
            exception: RuntimeException): UserDetails {
        return UserPrincipal(userCache.get(Pair.of(type, identifier), Supplier { loader.get() }) ?: throw exception)
    }

}