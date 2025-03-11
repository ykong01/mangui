package com.hejapp.security

import com.hejapp.domain.JwtTokenResponse
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import java.time.temporal.ChronoUnit
import java.util.*

@Component
class JwtUtils(
    private val jwtDecoder: JwtDecoder
) {

    private val logger = LoggerFactory.getLogger(JwtUtils::class.java)

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    fun obtainNewJwtPair(refreshToken: String): JwtTokenResponse {
        try {
            val decodedJWT = jwtDecoder.decode(refreshToken)
            val authentication = JwtAuthenticationToken(decodedJWT)
            return generateJwtPair(authentication)
        } catch (e: Exception) {
            logger.error("Failed to verify refresh token")
            throw JwtException("Failed to verify refresh token")
        }
    }

    fun generateJwtPair(authentication: Authentication): JwtTokenResponse {
        val user = authentication
        val now = Date()
        var expiryDate = Date.from(now.toInstant().plus(30, ChronoUnit.MINUTES))

        val claimsAccessToken = JWTClaimsSet.Builder()
            .subject(user.name)
            .issueTime(now)
            .expirationTime(expiryDate)
            .claim("roles", user.authorities.map { it.authority })
            .build()

        val signer = MACSigner(jwtSecret.toByteArray())
        val accessToken = SignedJWT(JWSHeader(JWSAlgorithm.HS256), claimsAccessToken)
        accessToken.sign(signer)

        expiryDate = Date.from(now.toInstant().plus(30, ChronoUnit.DAYS))
        val claimsRefreshToken = JWTClaimsSet.Builder()
            .subject(user.name)
            .issueTime(now)
            .expirationTime(expiryDate)
            .build()
        val refreshToken = SignedJWT(JWSHeader(JWSAlgorithm.HS256), claimsRefreshToken)
        refreshToken.sign(signer)

        return JwtTokenResponse(accessToken.serialize(), refreshToken.serialize())
    }
}