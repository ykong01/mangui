package com.majaku.exception

import org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(code = UNPROCESSABLE_ENTITY, reason = "BULK_WRITE_ERROR")
class BulkWriteException : RuntimeException()