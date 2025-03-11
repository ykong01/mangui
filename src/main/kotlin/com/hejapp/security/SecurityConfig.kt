package com.hejapp.security

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy.STATELESS
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import javax.crypto.spec.SecretKeySpec

@Configuration
@EnableScheduling
@EnableWebSecurity
class SecurityConfig(
    private val unauthorizedHandler: AuthEntryPoint
) {

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    @Bean
    fun authenticationManager(
        http: HttpSecurity,
        customMongoAuthenticationProvider: CustomMongoAuthenticationProvider
    ): AuthenticationManager {
        return http.getSharedObject(AuthenticationManagerBuilder::class.java)
            .authenticationProvider(customMongoAuthenticationProvider)
            .build()
    }

    @Bean
    fun jwtDecoder(): JwtDecoder {
        val secretKey = SecretKeySpec(jwtSecret.toByteArray(), "HmacSHA256")
        return NimbusJwtDecoder.withSecretKey(secretKey).build()
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors {}
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers("/auth/login", "/auth/logout", "/auth/hosts", "/auth/token/obtain").permitAll()
                it.anyRequest().hasRole("USER")
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2
                    .bearerTokenResolver(CookieBearerTokenResolver())
                    .jwt { jwt ->
                        jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
                    }
            }
            .exceptionHandling { it.authenticationEntryPoint(unauthorizedHandler) }

        return http.build()
    }
}