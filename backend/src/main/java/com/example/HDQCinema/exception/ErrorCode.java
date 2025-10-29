package com.example.HDQCinema.exception;

import lombok.AccessLevel;
import lombok.Getter;

import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    SEAT_UNAVAILABLE(1001, "1 of your seats has not available right now", HttpStatus.BAD_REQUEST),
    ROOM_NOT_EXISTED(1002, "room is not existed", HttpStatus.BAD_REQUEST),
    SHOWTIME_NOT_EXISTED(1003, "showtime is not existed", HttpStatus.BAD_REQUEST),

    USER_NOT_FOUND(2001, "user not found", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(2002, "unauthenticated user", HttpStatus.UNAUTHORIZED),
    UNCATEGORIZED_EXCEPTION(9999, "unknown error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHORIZED(2003, "unauthorized", HttpStatus.FORBIDDEN),
    ;

    int code = 1000;
    String message;
    HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

}
