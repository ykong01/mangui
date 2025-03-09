package com.hejapp.security

import com.hejapp.controller.CookieUtils
import com.hejapp.security.filter.JwtTokenFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy.STATELESS
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableScheduling
@EnableWebSecurity
class SecurityConfig(
    private val unauthorizedHandler: AuthEntryPoint,
    private val cookieUtils: CookieUtils
) {

    @Bean
    fun jwtTokenFilter(): JwtTokenFilter {
        return JwtTokenFilter(cookieUtils)
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors {}
            .csrf { it.disable() }
            .exceptionHandling { it.authenticationEntryPoint(unauthorizedHandler) }
            .sessionManagement { it.sessionCreationPolicy(STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers("/auth/login", "/auth/logout", "/auth/hosts", "/auth/token/obtain").permitAll()
                it.requestMatchers("/auth/user").fullyAuthenticated()
                it.anyRequest().fullyAuthenticated()
            }

        http.addFilterBefore(jwtTokenFilter(), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}