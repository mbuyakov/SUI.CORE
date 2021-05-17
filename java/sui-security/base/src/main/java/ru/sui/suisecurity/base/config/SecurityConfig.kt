package ru.sui.suisecurity.base.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.BeanIds
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.builders.WebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import ru.sui.suisecurity.base.security.AuthorizeRequestsCustomizer
import ru.sui.suisecurity.base.security.CustomUserDetailsService
import ru.sui.suisecurity.base.security.JwtAuthenticationEntryPoint
import ru.sui.suisecurity.base.security.JwtAuthenticationFilter
import ru.sui.suisecurity.base.utils.SudirBCryptPasswordEncoder
import javax.annotation.PostConstruct

@Configuration
class SecurityConfig(
        private val customUserDetailsService: CustomUserDetailsService,
        private val unauthorizedHandler: JwtAuthenticationEntryPoint,
        private val authorizeRequestsCustomizers: List<AuthorizeRequestsCustomizer>
) : WebSecurityConfigurerAdapter() {

    @PostConstruct
    fun postConstruct() {
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL)
    }

    @Bean
    fun jwtAuthenticationFilter(): JwtAuthenticationFilter = JwtAuthenticationFilter()

    override fun configure(authenticationManagerBuilder: AuthenticationManagerBuilder) {
        authenticationManagerBuilder
                .userDetailsService<UserDetailsService>(customUserDetailsService)
                .passwordEncoder(passwordEncoder())
    }

    @Bean(BeanIds.AUTHENTICATION_MANAGER)
    @Throws(Exception::class)
    override fun authenticationManagerBean(): AuthenticationManager {
        return super.authenticationManagerBean()
    }

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return SudirBCryptPasswordEncoder()
    }

    @Throws(Exception::class)
    override fun configure(web: WebSecurity) {
        web.ignoring().antMatchers(
                "/v2/api-docs",
                "/swagger-resources/**",
                "/swagger-ui.html",
                "/webjars/**",
                "/table-backend"
        )
    }

    @Throws(Exception::class)
    override fun configure(http: HttpSecurity) {
        http
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter::class.java)
                .cors()
                .and()
                .csrf()
                    .disable()
                .exceptionHandling()
                    .authenticationEntryPoint(unauthorizedHandler)
                .and()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                    .let { authorizeRequestsCustomizers.fold(it) { registry, customizer -> customizer.invoke(registry) } }
                    .anyRequest().authenticated()
    }

}
