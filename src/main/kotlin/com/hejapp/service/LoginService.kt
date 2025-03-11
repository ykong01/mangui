package com.hejapp.service

import com.hejapp.ApplicationContext
import com.hejapp.domain.JwtTokenResponse
import com.hejapp.exception.LoginFailedException
import com.hejapp.security.JwtUtils
import com.mongodb.MongoCredential
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.util.*

@Service
class LoginService(
    private val applicationContext: ApplicationContext,
    private val jwtUtils: JwtUtils,
    private val authenticationManager: AuthenticationManager
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

        val authToken = UsernamePasswordAuthenticationToken(userId, password)
        val authentication = authenticationManager.authenticate(authToken)
        SecurityContextHolder.getContext().authentication = authentication

        return jwtUtils.generateJwtPair(authentication);
    }
}