package com.hejapp.domain

data class JwtTokenResponse(
    val accessToken: String,
    val refreshToken: String
)