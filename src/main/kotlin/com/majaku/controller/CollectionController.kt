package com.majaku.controller

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.majaku.ApplicationContext
import com.majaku.domain.CollectionDataResponse
import com.majaku.exception.BulkWriteException
import com.mongodb.client.MongoCollection
import com.mongodb.client.model.InsertManyOptions
import com.mongodb.client.model.Sorts
import org.bson.BsonDocument
import org.bson.Document
import org.bson.conversions.Bson
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus.NO_CONTENT
import org.springframework.http.MediaType.parseMediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.ByteArrayOutputStream
import java.lang.String.join
import javax.servlet.http.HttpServletResponse


@RestController
@RequestMapping("/dbs/{db}/collections/{coll}")
class CollectionController(
    applicationContext: ApplicationContext
) : AbstractMongoController(applicationContext) {

    private val logger = LoggerFactory.getLogger(CollectionController::class.java)

    @DeleteMapping
    fun deleteCollection(@PathVariable("db") db: String, @PathVariable("coll") coll: String): ResponseEntity<Void> {
        getMongoClientFromContext().getDatabase(db).getCollection(coll).drop()
        return ResponseEntity.status(NO_CONTENT).build()
    }

    @GetMapping("/count")
    fun getCollectionSize(@PathVariable("db") db: String, @PathVariable("coll") coll: String): ResponseEntity<Int> {
        return ResponseEntity.ok(
            getMongoClientFromContext().getDatabase(db).getCollection(coll).estimatedDocumentCount().toInt()
        )
    }

    @GetMapping("/fields")
    fun getAllFieldsOfCollection(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
    ): ResponseEntity<CollectionDataResponse> {
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val result = collection.aggregate(
            listOf(
                Document("\$project", Document("arrayofkeyvalue", Document("\$objectToArray", "$\$ROOT"))),
                Document("\$unwind", "\$arrayofkeyvalue"),
                Document(
                    "\$group",
                    Document("_id", null).append("allkeys", Document("\$addToSet", "\$arrayofkeyvalue.k"))
                )
            )
        )
        if (result.toList().isEmpty()) {
            return ResponseEntity.unprocessableEntity().body(
                CollectionDataResponse(0, 0, emptyList())
            )
        }
        val fieldMap = result.toList()[0].filterKeys { k -> k == "allkeys" }
        val fields = fieldMap.entries.iterator().next().value as List<String>
        val fieldDocumentList = fields.map { t ->
            Document("field", t)
        }
        return ResponseEntity.ok(CollectionDataResponse(fields.size, fields.size, fieldDocumentList))
    }

    @PutMapping("/import")
    fun import(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestParam("type") type: String,
        @RequestBody file: MultipartFile,
    ): ResponseEntity<String> {
        try {
            if (type != "json") {
                return ResponseEntity.badRequest().body("Filetype is not json")
            }
            if (file.isEmpty) {
                return ResponseEntity.badRequest().body("File is empty")
            }

            val jsonString = String(file.bytes)
            val documents = jacksonObjectMapper().readValue(jsonString, object : TypeReference<List<Document>>() {})

            val options = InsertManyOptions().ordered(false)
            getMongoClientFromContext()
                .getDatabase(db)
                .getCollection(coll)
                .insertMany(documents, options)

            return ResponseEntity.ok().build()
        } catch (e: Exception) {
            throw BulkWriteException()
        }
    }

    @GetMapping("/export")
    fun export(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestParam("type") type: String,
        response: HttpServletResponse
    ): ResponseEntity<ByteArray> {
        if (type != "csv") {
            return ResponseEntity.badRequest().build()
        }

        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val fieldNames = HashSet<String>()
        var cursor = collection.find().iterator()
        var document = cursor.next()
        fieldNames.addAll(document.keys)

        val csvWriter = ByteArrayOutputStream()
        csvWriter.write((join(";", fieldNames) + "\n").toByteArray())

        cursor = collection.find().iterator()
        while (cursor.hasNext()) {
            document = cursor.next()
            for (fieldName in fieldNames) {
                val fieldValue = document[fieldName]
                    ?.toString()
                    ?.lines()
                    ?.joinToString("")
                    ?.replace(";", ",") ?: ""
                csvWriter.write(("$fieldValue;").toByteArray())
            }
            csvWriter.write("\n".toByteArray())
        }

        val headers = HttpHeaders()
        headers.contentType = parseMediaType("text/csv")
        headers.setContentDispositionFormData("attachment", "$coll-export.csv")

        return ResponseEntity.ok()
            .headers(headers)
            .body(csvWriter.toByteArray())
    }

    @GetMapping("/find")
    fun find(
        @PathVariable("db") db: String,
        @PathVariable("coll") coll: String,
        @RequestParam("query") query: String,
        @RequestParam("explain", defaultValue = "false") explain: String?,
        @RequestParam("order", defaultValue = "ASC") orderParam: String?,
        @RequestParam("orderBy", defaultValue = "_id") orderByParam: String?,
        @RequestParam("limit", defaultValue = "25") limit: String?,
        @RequestParam("page", defaultValue = "0") page: String?
    ): ResponseEntity<CollectionDataResponse> {
        var currentPage = page!!.toInt()
        if (currentPage < 0) {
            currentPage = 0
        }
        val limitSize = limit!!.toInt()
        val skip = currentPage * limitSize
        val collection = getMongoClientFromContext().getDatabase(db).getCollection(coll)
        val queryText = sanitizeQuery(query)
        val totalDocumentCount = collection.countDocuments(BsonDocument.parse(queryText)).toInt()
        return if (explain.toBoolean()) {
            explainQuery(collection, queryText, totalDocumentCount)
        } else {
            val list = collection.find(BsonDocument.parse(queryText))
                .skip(skip)
                .limit(limitSize)
                .sort(sortResult(orderParam, orderByParam))
                .map(this::transformDocumentId)
                .toList()
            ResponseEntity.ok(CollectionDataResponse(list.size, totalDocumentCount, list))
        }
    }

    private fun sortResult(order: String?, orderByParam: String?): Bson {
        return if ("ASC".equals(order, true))
            Sorts.ascending(orderByParam)
        else
            Sorts.descending(orderByParam)
    }

    private fun transformDocumentId(doc: Document): Document {
        if (doc["_id"] is ObjectId) {
            doc.replace("_id", "ObjectId('${doc.getObjectId("_id")}')")
        }
        return doc
    }

    private fun explainQuery(
        collection: MongoCollection<Document>,
        queryText: String,
        totalDocumentCount: Int
    ): ResponseEntity<CollectionDataResponse> {
        val list = listOf(
            collection.find(
                BsonDocument.parse(queryText)
            ).explain()
        )
        return ResponseEntity.ok(CollectionDataResponse(list.size, totalDocumentCount, list))
    }
}
