package com.majaku.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component
class JwtAuthenticationProvider : AuthenticationProvider {

    private val logger = LoggerFactory.getLogger(JwtAuthenticationProvider::class.java)

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    override fun authenticate(authentication: Authentication): Authentication {
        try {
            val token = authentication.credentials as String
            val algorithm = Algorithm.HMAC256(jwtSecret)
            val verifier = JWT.require(algorithm)
                .withClaim("access", true)
                .build()
            val decodedJWT = verifier.verify(token)
            logger.debug("[${decodedJWT.subject}] authenticated successfully")
            return JwtAuthentication(token, decodedJWT.subject, true)
        } catch (e: Exception) {
            logger.error("Failed to verify access token")
            throw JWTVerificationException("Failed to verify access token")
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        return JwtAuthentication::class.java == authentication
    }
}