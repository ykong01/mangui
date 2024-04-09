package com.majaku.controller

import com.majaku.ApplicationContext
import com.majaku.domain.UpdateUserRequest
import com.mongodb.BasicDBObject
import org.bson.Document
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType.APPLICATION_JSON_VALUE
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/dbs/{db}/user")
class UserController(
    applicationContext: ApplicationContext
) : AbstractMongoController(applicationContext) {

    private val logger = LoggerFactory.getLogger(UserController::class.java)

    @PutMapping(path = ["/update"], consumes = [APPLICATION_JSON_VALUE])
    fun updateUser(
        @PathVariable("db") db: String,
        @RequestBody updateUserRequest: UpdateUserRequest
    ): ResponseEntity<String> {
        val commandArguments = HashMap<String, Any>()
        updateUserRequest.password?.let {
            commandArguments["updateUser"] = updateUserRequest.user
            commandArguments["pwd"] = it
            val updateUserDBObject = BasicDBObject(commandArguments)
            getMongoClientFromContext().getDatabase(db).runCommand(updateUserDBObject)
            return ResponseEntity.ok().build()
        }
        return ResponseEntity.noContent().build()
    }

    @PutMapping(consumes = [APPLICATION_JSON_VALUE])
    fun createUser(
        @PathVariable("db") db: String,
        @RequestBody createUserRequest: CreateUserRequest
    ): ResponseEntity<String> {
        val command = Document(
            "createUser", createUserRequest.user
        ).append(
            "pwd", createUserRequest.password
        ).append(
            "roles", createUserRequest.roles.map { role -> Document("role", role.role).append("db", role.db) }
        )
        getMongoClientFromContext().getDatabase(db).runCommand(command)

        return ResponseEntity.ok().build()
    }

    data class CreateUserRequest(
        val user: String,
        val password: String,
        val roles: List<UserRole>
    ) {
        data class UserRole(
            val role: String,
            val db: String,
        )
    }
}