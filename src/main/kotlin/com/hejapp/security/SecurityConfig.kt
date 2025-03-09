package com.hejapp.security

import com.hejapp.controller.CookieUtils
import com.hejapp.security.filter.JwtTokenFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy.STATELESS
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableScheduling
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
        http.cors().and().csrf().disable()
            .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
            .sessionManagement().sessionCreationPolicy(STATELESS).and()
            .authorizeRequests()
            .antMatchers("/auth/login", "/auth/logout", "/auth/hosts", "/auth/token/obtain")
            .permitAll()
            .antMatchers("/auth/user")
            .fullyAuthenticated()
            .anyRequest()
            .fullyAuthenticated()

        http.addFilterBefore(jwtTokenFilter(), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }
}