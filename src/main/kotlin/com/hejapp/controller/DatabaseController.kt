package com.hejapp.controller

import com.hejapp.ApplicationContext
import com.hejapp.domain.CollectionInfoResponse
import org.bson.Document
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus.CREATED
import org.springframework.http.HttpStatus.NO_CONTENT
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/dbs")
class DatabaseController(
    applicationContext: ApplicationContext
) : AbstractMongoController(applicationContext) {

    private val logger = LoggerFactory.getLogger(DatabaseController::class.java)

    @GetMapping
    fun getDatabases(): ResponseEntity<List<Document>> {
        return ResponseEntity.ok(getMongoClientFromContext().listDatabases().toList())
    }

    @GetMapping("/{db}/collections")
    fun getCollections(@PathVariable("db") db: String): ResponseEntity<List<CollectionInfoResponse>> {
        val collections = getMongoClientFromContext().getDatabase(db).listCollections().toList()
        val collectionCount = collections.map { collection ->
            val name = collection.getString("name")
            val count = getMongoClientFromContext().getDatabase(db).getCollection(name).estimatedDocumentCount()
            CollectionInfoResponse(name, count.toInt())
        }
            .toList()
        return ResponseEntity.ok(collectionCount)
    }

    @PostMapping("/create")
    fun createDatabase(@RequestBody createDatabaseRequest: CreateDatabaseRequest): ResponseEntity<Void> {
        getMongoClientFromContext().getDatabase(createDatabaseRequest.databaseName)
        return ResponseEntity.status(CREATED).build()
    }

    @PostMapping("/{db}/collections/create")
    fun createCollection(
        @PathVariable("db") db: String,
        @RequestBody createCollectionRequest: CreateCollectionRequest
    ): ResponseEntity<Void> {
        getMongoClientFromContext().getDatabase(db).createCollection(createCollectionRequest.collectionName)
        return ResponseEntity.status(CREATED).build()
    }

    @DeleteMapping("/{db}")
    fun deleteDatabase(@PathVariable("db") db: String): ResponseEntity<Void> {
        getMongoClientFromContext().getDatabase(db).drop()
        return ResponseEntity.status(NO_CONTENT).build()
    }
}

data class CreateDatabaseRequest(val databaseName: String)
data class CreateCollectionRequest(val collectionName: String)
