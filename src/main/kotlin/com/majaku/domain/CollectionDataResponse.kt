package com.majaku.domain

import org.bson.Document

data class CollectionDataResponse(
    val documentCount: Int,
    val totalDocumentCount: Int,
    val documentList: List<Document>
)
