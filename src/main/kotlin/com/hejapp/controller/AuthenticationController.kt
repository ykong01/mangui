package com.hejapp.controller

import com.hejapp.ApplicationContext
import com.hejapp.domain.JwtTokenResponse
import com.hejapp.domain.LoginRequest
import com.hejapp.exception.RefreshTokenMissingException
import com.hejapp.security.JwtUtils
import com.hejapp.service.LoginService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.bson.Document
import org.bson.json.JsonObject
import org.springframework.core.env.Environment
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.util.StringUtils
import org.springframework.web.bind.annotation.*
import org.springframework.web.util.WebUtils

@RestController
@RequestMapping("/auth")
class AuthenticationController(
    private val loginService: LoginService,
    private val applicationContext: ApplicationContext,
    private val environment: Environment,
    private val cookieUtils: CookieUtils,
    private val jwtUtils: JwtUtils
) : AbstractMongoController(applicationContext) {

    @PostMapping("/login")
    fun login(
        @RequestBody loginRequest: LoginRequest,
        response: HttpServletResponse
    ): ResponseEntity<JwtTokenResponse> {
        val jwtTokenResponse = loginService.login(
            loginRequest.user,
            loginRequest.password,
            loginRequest.db,
            loginRequest.uri
        )

        cookieUtils.addTokenCookiesToResponse(response, jwtTokenResponse)

        return ResponseEntity.ok().build()
    }

    @GetMapping("/logout")
    fun logout(response: HttpServletResponse): ResponseEntity<Void> {
        val user = SecurityContextHolder.getContext().authentication.principal
        applicationContext.deleteMongoClient(user as String)
        SecurityContextHolder.clearContext()
        cookieUtils.deleteCookies(response)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/hosts")
    fun getHosts(): List<String> {
        return environment
            .getProperty("app.mongodb.hosts", "mongodb://localhost:27017")
            .split(",")
    }

    @GetMapping("/token/obtain")
    fun generateNewJwtTokenPair(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): ResponseEntity<JwtTokenResponse> {
        val refreshToken = WebUtils.getCookie(request, "mongodbui_rt")?.value
        if (!StringUtils.hasText(refreshToken)) {
            logout(response)
            throw RefreshTokenMissingException()
        }
        val jwtTokenResponse = jwtUtils.obtainNewJwtPair(refreshToken!!)

        cookieUtils.addTokenCookiesToResponse(response, jwtTokenResponse)

        return ResponseEntity.ok().build()
    }

    @GetMapping("/user")
    fun getAuthenticatedUser(): Document? {
        val db = getMongoClientFromContext().getDatabase("admin")
        val response =
            db.runCommand(JsonObject("{ connectionStatus: 1, showPrivileges: false }")) // see: https://www.mongodb.com/docs/manual/reference/command/connectionStatus/#mongodb-dbcommand-dbcmd.connectionStatus
        return if (response.getDouble("ok") == 1.0) {
            ((response["authInfo"] as Document).getList("authenticatedUsers", Document::class.java)[0])
        } else null
    }
}