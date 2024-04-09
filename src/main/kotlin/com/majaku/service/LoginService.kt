package com.majaku.service

import com.majaku.ApplicationContext
import com.majaku.domain.JwtTokenResponse
import com.majaku.exception.LoginFailedException
import com.majaku.security.JwtUtils
import com.mongodb.MongoCredential
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.*

@Service
class LoginService(
    private val applicationContext: ApplicationContext,
    private val jwtUtils: JwtUtils
) {
    private val logger = LoggerFactory.getLogger(LoginService::class.java)

    fun login(user: String, password: String, db: String, uri: String): JwtTokenResponse {
        val userCredentials = MongoCredential.createCredential(user, db, password.toCharArray())
        val userId = UUID.randomUUID().toString()
        val mongoClient = applicationContext.addMongoClient(userId, userCredentials, uri)
        try {
            val testConnectionDatabase = mongoClient.getDatabase(db)
            val collections = testConnectionDatabase.listCollections()
            val collectionSize = collections.count()
        } catch (e: Exception) {
            applicationContext.deleteMongoClient(userId)
            logger.error("Error occurred while connecting to MongoDB database. Check the connection details.")
            throw LoginFailedException()
        }

        return jwtUtils.generateJwtPair(userId);
    }
}