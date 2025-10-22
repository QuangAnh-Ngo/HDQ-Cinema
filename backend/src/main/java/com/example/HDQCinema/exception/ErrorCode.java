package com.example.HDQCinema.exception;

import lombok.AccessLevel;
import lombok.Getter;

import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    SEAT_UNAVAILABLE(1001, "1 of your seats has not available right now", HttpStatus.BAD_REQUEST),
    ROOM_NOT_EXISTED(1002, "room is not existed", HttpStatus.BAD_REQUEST),
    SHOWTIME_NOT_EXISTED(1003, "showtime is not existed", HttpStatus.BAD_REQUEST)
    ;

    int code;

    String message;
    HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

}
