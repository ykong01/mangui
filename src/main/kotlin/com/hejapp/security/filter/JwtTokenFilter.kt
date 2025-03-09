package com.hejapp.security.filter

import com.hejapp.controller.CookieUtils
import com.hejapp.security.JwtAuthentication
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders.AUTHORIZATION
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.WebUtils
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class JwtTokenFilter(
    private val cookieUtils: CookieUtils
) : OncePerRequestFilter() {

    @Value("\${app.jwt.secret}")
    private lateinit var jwtSecret: String

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val jwt = resolveToken(request)
        if (StringUtils.hasText(jwt)) {
            val authentication = JwtAuthentication(jwt!!, null, false)
            SecurityContextHolder.getContext().authentication = authentication
        }
        filterChain.doFilter(request, response)
        resetAuthenticationAfterRequest()
    }

    private fun resetAuthenticationAfterRequest() {
        SecurityContextHolder.getContext().authentication = null
    }

    private fun resolveToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader(AUTHORIZATION)
        return if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7, bearerToken.length)
        } else {
            WebUtils.getCookie(request, "mongodbui_at")?.value
        }
    }
}