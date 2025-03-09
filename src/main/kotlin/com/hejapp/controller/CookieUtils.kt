package com.hejapp.controller

import com.hejapp.domain.JwtTokenResponse
import org.springframework.stereotype.Component
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

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
        const val AT_PATH = "/dbs"
        const val USER_PATH = "/auth/user"
        const val RT_PATH = "/auth/token/obtain"
    }
}