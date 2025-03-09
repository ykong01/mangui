package com.hejapp.security

import org.slf4j.LoggerFactory
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED

@Component
class AuthEntryPoint : AuthenticationEntryPoint {

    private val logger = LoggerFactory.getLogger(AuthEntryPoint::class.java)

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        logger.info("${request.requestURI} unauthorized")
        response.status = SC_UNAUTHORIZED
        response.writer.write("UNAUTHORIZED")
    }
}