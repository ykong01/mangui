package com.majaku.domain

data class LoginRequest(
    val user: String,
    val password: String,
    val db: String,
    val uri: String
)