package com.hejapp.controller

import com.hejapp.domain.JwtTokenResponse
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletResponse
import org.springframework.stereotype.Component

@Component
class CookieUtils {

    fun addTokenCookiesToResponse(
        response: HttpServletResponse,
        jwtTokenResponse: JwtTokenResponse
    ) {
        val atCookie = Cookie("mongodbui_at", jwtTokenResponse.accessToken)
        atCookie.secure = true
        atCookie.isHttpOnly = true
        atCookie.path = AT_PATH
        atCookie.maxAge = 1800 // 30 min
        response.addCookie(atCookie)

        val atCookie2 = Cookie("mongodbui_at", jwtTokenResponse.accessToken)
        atCookie2.secure = true
        atCookie2.isHttpOnly = true
        atCookie2.path = USER_PATH
        atCookie2.maxAge = 1800 // 30 min
        response.addCookie(atCookie2)

        val rtCookie = Cookie("mongodbui_rt", jwtTokenResponse.refreshToken)
        rtCookie.secure = true
        rtCookie.isHttpOnly = true
        rtCookie.path = RT_PATH
        rtCookie.maxAge = 2592000 // 30 days
        response.addCookie(rtCookie)
    }

    fun deleteCookies(response: HttpServletResponse) {
        val atCookie = Cookie("mongodbui_at", null)
        atCookie.secure = true
        atCookie.isHttpOnly = true
        atCookie.path = AT_PATH
        atCookie.maxAge = 0
        response.addCookie(atCookie)

        val atCookie2 = Cookie("mongodbui_at", null)
        atCookie2.secure = true
        atCookie2.isHttpOnly = true
        atCookie2.path = USER_PATH
        atCookie2.maxAge = 0
        response.addCookie(atCookie2)

        val rtCookie = Cookie("mongodbui_rt", null)
        rtCookie.secure = true
        rtCookie.isHttpOnly = true
        rtCookie.path = RT_PATH
        rtCookie.maxAge = 0
        response.addCookie(rtCookie)
    }

    companion object {
        private const val BASE_PATH = "/api"
        const val AT_PATH = "$BASE_PATH/dbs"
        const val USER_PATH = "$BASE_PATH/auth/user"
        const val RT_PATH = "$BASE_PATH/auth/token/obtain"
    }
}