package com.hejapp.security

import org.springframework.core.convert.converter.Converter
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter

fun jwtAuthenticationConverter(): Converter<Jwt, AbstractAuthenticationToken> {
    val jwtAuthenticationConverter = JwtAuthenticationConverter()
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter { jwt ->
        val roles: List<String> = jwt.getClaimAsStringList("roles") ?: emptyList()
        roles.map { SimpleGrantedAuthority(it) }
    }
    return jwtAuthenticationConverter
}