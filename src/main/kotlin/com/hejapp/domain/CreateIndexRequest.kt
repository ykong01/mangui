package com.hejapp.domain

data class CreateIndexRequest(
    val keys: Map<String, String>,
    val unique: Boolean?,
    val background: Boolean?
)
