package com.majaku.exception

import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(code = UNAUTHORIZED, reason = "REFRESH_TOKEN_MISSING")
class RefreshTokenMissingException : RuntimeException()