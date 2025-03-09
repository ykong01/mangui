package com.hejapp.controller

import com.hejapp.ApplicationContext
import com.hejapp.domain.CollectionDataResponse
import com.hejapp.domain.CreateIndexRequest
import com.mongodb.client.model.IndexOptions
import com.mongodb.client.model.Indexes
import org.bson.Document
import org.bson.conversions.Bson
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.http.ResponseEntity
import org.springframework.util.StringUtils
import org.springframework.web.bind.annotation.*
import java.net.URI

@RestController
@RequestMapping("/dbs/{db}/collections/{coll}/indices")
class IndexController(
    applicationContext: ApplicationContext
) : AbstractMongoController(applicationContext) {

    private val logger = LoggerFactory.getLogger(IndexController::class.java)

    @GetMapping
    fun getIndices(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String
    ): ResponseEntity<CollectionDataResponse> {
        val indicesList = getMongoClientFromContext().getDatabase(db).getCollection(coll)
            .listIndexes()
            .map(this::transformDocumentId)
            .toList()
        return ResponseEntity.ok(CollectionDataResponse(indicesList.size, indicesList.size, indicesList))
    }

    @PostMapping(consumes = [APPLICATION_JSON_VALUE])
    fun insertIndex(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestBody item: CreateIndexRequest
    ): ResponseEntity<String> {
        if (item.keys.isEmpty()) {
            return ResponseEntity.badRequest().body("Provide keys")
        }
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val indexOptions = IndexOptions()
        indexOptions.unique(item.unique != null && item.unique)
        indexOptions.background(item.background != null && item.background)
        val indexName = collection.createIndex(createKeysFromMap(item.keys), indexOptions)
        return ResponseEntity.created(URI(indexName.replace(" ", "%20"))).build()
    }

    @DeleteMapping("/{name}")
    fun dropIndex(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @PathVariable("name") indexName: String
    ): ResponseEntity<String> {
        if (!StringUtils.hasText(indexName)) {
            return ResponseEntity.badRequest().body("Provide an index name")
        }
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        collection.dropIndex(indexName)
        return ResponseEntity.noContent().build()
    }

    private fun transformDocumentId(doc: Document): Document {
        if (doc["_id"] is ObjectId) {
            doc.replace("_id", "ObjectId('${doc.getObjectId("_id")}')")
        }
        return doc
    }

    private fun createKeysFromMap(keyMap: Map<String, String>): Bson {
        val ascEntries = keyMap.entries.stream().filter { t -> "1" == t.value }.map { e -> e.key }.toList()
        val descEntries = keyMap.entries.stream().filter { t -> "-1" == t.value }.map { e -> e.key }.toList()
        if (ascEntries.isEmpty() && descEntries.isEmpty()) {
            throw IllegalArgumentException("Cannot find valid index order parameter")
        }
        return if (ascEntries.isNotEmpty() && descEntries.isNotEmpty()) {
            Indexes.compoundIndex(Indexes.ascending(ascEntries), Indexes.descending(descEntries))
        } else if (ascEntries.isNotEmpty() && descEntries.isEmpty()) {
            Indexes.ascending(ascEntries)
        } else {
            Indexes.descending(descEntries)
        }
    }
}