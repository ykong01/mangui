package com.majaku

import com.mongodb.ConnectionString
import com.mongodb.MongoClientSettings
import com.mongodb.MongoCompressor.createZlibCompressor
import com.mongodb.MongoCredential
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.connection.ClusterConnectionMode
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.util.*
import java.util.concurrent.TimeUnit

@Component
class ApplicationContext {

    private val logger = LoggerFactory.getLogger(ApplicationContext::class.java)

    fun getMongoClient(userId: String): MongoClient? {
        synchronized(mongoClientMap) {
            if (mongoClientMap.containsKey(userId)) {
                return mongoClientMap[userId]!!
            }
            return null
        }
    }

    fun addMongoClient(userId: String, userCredentials: MongoCredential, mongoDbUri: String): MongoClient {
        synchronized(mongoClientMap) {
            val mongoClientSettings = MongoClientSettings.builder()
                .credential(userCredentials)
                .applyConnectionString(ConnectionString(mongoDbUri))
                .applyToSocketSettings { socket ->
                    socket.connectTimeout(1000, TimeUnit.MILLISECONDS)
                    socket.readTimeout(1000, TimeUnit.MILLISECONDS)
                }
                .applyToClusterSettings { cluster ->
                    cluster.serverSelectionTimeout(1000, TimeUnit.MILLISECONDS)
                    cluster.mode(ClusterConnectionMode.SINGLE)
                }
                .applyToConnectionPoolSettings { pool ->
                    pool.maxConnecting(2)
                    pool.maxSize(2)
                    pool.maxConnectionLifeTime(2, TimeUnit.MINUTES)
                    pool.maxConnectionIdleTime(10, TimeUnit.MINUTES)
                }
                .applyToServerSettings { server ->
                    server.minHeartbeatFrequency(1, TimeUnit.MINUTES)
                    server.heartbeatFrequency(1, TimeUnit.MINUTES)
                }
                .compressorList(
                    listOf(createZlibCompressor())
                )
                .build()

            val mongoClient = MongoClients.create(mongoClientSettings)
            mongoClientMap[userId] = mongoClient

            return mongoClient
        }
    }

    fun deleteMongoClient(userId: String) {
        synchronized(mongoClientMap) {
            if (mongoClientMap.containsKey(userId)) {
                mongoClientMap[userId]!!.close()
                mongoClientMap.remove(userId)
            }
        }
    }

    @Scheduled(timeUnit = TimeUnit.DAYS, fixedRate = 30)
    fun deleteUnusedMongoClients() {
        synchronized(mongoClientMap) {
            mongoClientMap.forEach {
                logger.info("Deleting unused Mongo client(${it.key}) after 30 days")
                deleteMongoClient(it.key)
            }
            mongoClientMap.clear()
        }
    }

    fun getMongoClients(): Map<String, MongoClient> {
        synchronized(mongoClientMap) {
            return Collections.unmodifiableMap(mongoClientMap)
        }
    }

    fun printMongoClients() {
        mongoClientMap.forEach { println("${it.key} -> ${it.value.clusterDescription}") }
    }

    companion object {
        private val mongoClientMap = Collections.synchronizedMap(HashMap<String, MongoClient>())
    }
}