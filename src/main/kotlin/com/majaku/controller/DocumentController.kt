package com.majaku.controller

import com.majaku.ApplicationContext
import com.majaku.domain.CreateDocumentRequest
import com.majaku.domain.UpdateDocumentRequest
import com.mongodb.client.result.DeleteResult
import org.bson.BsonDocument
import org.bson.Document
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus.*
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.http.ResponseEntity
import org.springframework.util.StringUtils
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/dbs/{db}/collections/{coll}/documents")
class DocumentController(
    applicationContext: ApplicationContext
) : AbstractMongoController(applicationContext) {

    private val logger = LoggerFactory.getLogger(DocumentController::class.java)

    @DeleteMapping
    fun dropDocument(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestParam("id") idQuery: String
    ): ResponseEntity<String> {
        if (!StringUtils.hasText(idQuery)) {
            return ResponseEntity.badRequest().body("Provide an item id")
        }
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val deleteResult: DeleteResult
        if (idQuery.contains("ObjectId")) {
            val queryText = sanitizeQuery("_id:$idQuery")
            deleteResult = collection.deleteOne(BsonDocument.parse(queryText))
        } else {
            deleteResult = collection.deleteOne(Document("_id", idQuery))
        }
        return ResponseEntity.status(
            if (deleteResult.deletedCount > 0) NO_CONTENT else UNPROCESSABLE_ENTITY
        ).build()
    }

    @PutMapping(consumes = [APPLICATION_JSON_VALUE])
    fun updateDocument(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestBody updateDocumentRequest: UpdateDocumentRequest
    ): ResponseEntity<String> {
        if (!StringUtils.hasText(updateDocumentRequest.idQuery) || !StringUtils.hasText(updateDocumentRequest.updateDocument)) {
            return ResponseEntity.badRequest().body("Provide an item and/or query id")
        }
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val queryText = sanitizeQuery(updateDocumentRequest.idQuery)
        val updateText = sanitizeQuery(updateDocumentRequest.updateDocument)
        val updateResult = collection.replaceOne(BsonDocument.parse(queryText), Document.parse(updateText))
        return ResponseEntity.status(
            if (updateResult.modifiedCount > 0) OK else UNPROCESSABLE_ENTITY
        )
            .build()
    }

    @PostMapping(consumes = [APPLICATION_JSON_VALUE])
    fun insertDocument(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestBody createDocumentRequest: CreateDocumentRequest
    ): ResponseEntity<String> {
        if (!StringUtils.hasText(createDocumentRequest.document)) {
            return ResponseEntity.badRequest().body("Provide a document body")
        }
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val itemText = sanitizeQuery(createDocumentRequest.document)
        val insertOneResult = collection.insertOne(Document.parse(itemText))
        return if (insertOneResult.insertedId != null) {
            ResponseEntity.created(URI("")).build()
        } else {
            ResponseEntity.unprocessableEntity().build()
        }
    }
}