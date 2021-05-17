package ru.sui.suisecurity.base.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import ru.sui.suisecurity.base.security.AuthorizeRequestsCustomizer

@Configuration
class AuthorizeRequestsCustomizerConfig {

    @Bean
    fun staticResourcesAuthorizeRequestsCustomizer(): AuthorizeRequestsCustomizer {
        val paths = arrayOf(
            "/",
            "/csrf",
            "/favicon.ico",
            "/**/*.png",
            "/**/*.gif",
            "/**/*.svg",
            "/**/*.jpg",
            "/**/*.html",
            "/**/*.css",
            "/**/*.js",
            "/**/*.mp3"
        )

        return { it.antMatchers(*paths).permitAll() }
    }

    @Bean
    fun backendAuthorizeRequestsCustomizer(): AuthorizeRequestsCustomizer {
        return { registry ->
            registry
                .antMatchers("/table-backend").permitAll()
                .antMatchers("/table-backend/**").permitAll()
        }
    }

    @Bean
    fun securityAuthorizeRequestsCustomizer(): AuthorizeRequestsCustomizer {
        return { registry ->
            registry
                  .antMatchers("/api/auth/**").permitAll()
                  .antMatchers("/api/token/**").permitAll()
        }
    }

    @Bean
    fun corsAuthorizeRequestsCustomizer(): AuthorizeRequestsCustomizer {
        return { it.antMatchers(HttpMethod.OPTIONS, "/**").permitAll() }
    }

    @Bean
    fun deprecatedTrashAuthorizeRequestsCustomizer(): AuthorizeRequestsCustomizer {
        return { registry ->
            registry
                .antMatchers("/api/tracks/download/**").permitAll()
                .antMatchers("/api/images/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/or2/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                .antMatchers("/api/user/checkUsernameAvailability", "/api/user/checkEmailAvailability").permitAll()
        }
    }

}
