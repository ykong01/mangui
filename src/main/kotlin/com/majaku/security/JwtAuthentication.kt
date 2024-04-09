package com.majaku.security

import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority

class JwtAuthentication(
    private val token: String,
    private val userId: String?,
    private var authenticated: Boolean
) : Authentication {

    override fun getName(): String? {
        return null
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority>? {
        return null
    }

    override fun getCredentials(): Any {
        return token
    }

    override fun getDetails(): Any? {
        return null
    }

    override fun getPrincipal(): String? {
        return userId
    }

    override fun isAuthenticated(): Boolean {
        return authenticated
    }

    override fun setAuthenticated(isAuthenticated: Boolean) {
        authenticated = isAuthenticated
    }

}
