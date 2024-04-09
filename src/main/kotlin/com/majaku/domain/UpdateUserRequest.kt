package com.majaku.domain

data class UpdateUserRequest(
    val user: String,
    val password: String?,
)