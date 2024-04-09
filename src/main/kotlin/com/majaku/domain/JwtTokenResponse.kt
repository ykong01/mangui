package com.majaku.domain

data class JwtTokenResponse(
    val accessToken: String,
    val refreshToken: String
)