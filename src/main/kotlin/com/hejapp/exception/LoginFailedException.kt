package com.hejapp.exception

import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(code = UNAUTHORIZED, reason = "LOGIN_FAILED")
class LoginFailedException : RuntimeException()