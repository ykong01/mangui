package com.majaku.security

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTVerificationException
import com.majaku.domain.JwtTokenResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

@Component
class JwtUtils {

    private val logger = LoggerFactory.getLogger(JwtUtils::class.java)

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    fun obtainNewJwtPair(refreshToken: String): JwtTokenResponse {
        try {
            val algorithm = Algorithm.HMAC256(jwtSecret)
            val verifier = JWT.require(algorithm)
                .build()
            val decodedJWT = verifier.verify(refreshToken)
            return generateJwtPair(decodedJWT.subject);
        } catch (e: Exception) {
            logger.error("Failed to verify refresh token")
            throw JWTVerificationException("Failed to verify refresh token")
        }
    }

    fun generateJwtPair(userId: String): JwtTokenResponse {
        val algorithm = Algorithm.HMAC256(jwtSecret)

        val accessToken = JWT.create()
            .withSubject(userId)
            .withClaim("access", true)
            .withExpiresAt(
                Date.from(
                    Instant.now().plus(30, ChronoUnit.MINUTES)
                )
            ).sign(algorithm)

        val refreshToken = JWT.create()
            .withSubject(userId)
            .withExpiresAt(
                Date.from(
                    Instant.now().plus(30, ChronoUnit.DAYS)
                )
            ).sign(algorithm)

        return JwtTokenResponse(accessToken, refreshToken)
    }
}