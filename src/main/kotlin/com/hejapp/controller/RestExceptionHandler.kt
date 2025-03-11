package com.hejapp.controller

import com.auth0.jwt.exceptions.JWTVerificationException
import com.hejapp.domain.CollectionDataResponse
import com.hejapp.exception.SessionExpiredException
import com.mongodb.MongoCommandException
import com.mongodb.MongoException
import com.mongodb.WriteConcernException
import jakarta.servlet.http.HttpServletResponse
import org.bson.json.JsonParseException
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class RestExceptionHandler(
    private val cookieUtils: CookieUtils
) {
    private val logger = LoggerFactory.getLogger(RestExceptionHandler::class.java)

    @ExceptionHandler(value = [MongoCommandException::class])
    fun mongoCommandException(e: MongoCommandException): ResponseEntity<String> {
        logger.error("MongoDB Error [${e.errorMessage}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        when (e.errorCodeName) {
            "Unauthorized" ->
                return ResponseEntity.status(UNAUTHORIZED).body("DATABASE_ERROR")
        }
        return ResponseEntity.unprocessableEntity().body("DATABASE_ERROR")
    }

    @ExceptionHandler(value = [JsonParseException::class])
    fun jsonParseException(e: JsonParseException): ResponseEntity<CollectionDataResponse> {
        logger.error("Error [${e.message}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        return ResponseEntity.unprocessableEntity().body(CollectionDataResponse(0, 0, emptyList()))
    }

    @ExceptionHandler(value = [IllegalArgumentException::class])
    fun illegalArgumentException(e: IllegalArgumentException): ResponseEntity<Void> {
        logger.error("Error [${e.message}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        return ResponseEntity.unprocessableEntity().build()
    }

    @ExceptionHandler(value = [JWTVerificationException::class])
    fun jwtVerificationException(e: JWTVerificationException, response: HttpServletResponse): ResponseEntity<Void> {
        logger.error("JWT error [${e.message}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        cookieUtils.deleteCookies(response)
        return ResponseEntity.status(UNAUTHORIZED).build()
    }

    @ExceptionHandler(value = [WriteConcernException::class])
    fun writeConcernException(e: WriteConcernException): ResponseEntity<Void> {
        logger.error("MongoDB write error [${e.errorMessage}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        return ResponseEntity.unprocessableEntity().build()
    }

    @ExceptionHandler(value = [MongoException::class])
    fun generalMongoException(e: MongoException): ResponseEntity<Void> {
        logger.error("General MongoDB error [${e.message}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        return ResponseEntity.unprocessableEntity().build()
    }

    @ExceptionHandler(value = [SessionExpiredException::class])
    fun sessionExpiredException(e: SessionExpiredException, response: HttpServletResponse): ResponseEntity<String> {
        logger.error("Session error [${e.message}] occurred for user ${SecurityContextHolder.getContext().authentication.principal}")
        cookieUtils.deleteCookies(response)
        return ResponseEntity.status(UNAUTHORIZED).body("SESSION_EXPIRED")
    }
}