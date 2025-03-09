package com.hejapp.domain

data class UpdateUserRequest(
    val user: String,
    val password: String?,
)