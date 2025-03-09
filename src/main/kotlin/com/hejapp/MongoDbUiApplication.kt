package com.hejapp

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration
import org.springframework.boot.runApplication

@SpringBootApplication(
    exclude = [
        MongoAutoConfiguration::class,
        MongoDataAutoConfiguration::class
    ]
)
class MongoDbUiApplication

fun main(args: Array<String>) {
    runApplication<MongoDbUiApplication>(*args)
}
