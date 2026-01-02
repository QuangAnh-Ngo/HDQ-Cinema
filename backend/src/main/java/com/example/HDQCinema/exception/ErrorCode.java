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
    BOOKING_FAIL(1004, "booking failed", HttpStatus.BAD_REQUEST),


    USER_NOT_FOUND(2001, "user not found", HttpStatus.NOT_FOUND),
    USER_EXISTED(2002, "user already existed", HttpStatus.CONFLICT),

    ROLE_NOT_FOUND(3001, "role not found", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(3002, "role already existed", HttpStatus.CONFLICT),

    PERMISSION_NOT_FOUND(4001, "permission not found", HttpStatus.NOT_FOUND),
    PERMISSION_EXISTED(4002, "permission already existed", HttpStatus.CONFLICT),

    EMPLOYEE_NOT_FOUND(5001, "employee not found", HttpStatus.NOT_FOUND),

    MEMBER_NOT_FOUND(6001, "member not found", HttpStatus.NOT_FOUND),
    MEMBER_EXISTED(6002, "member already existed", HttpStatus.CONFLICT),

    INVALID_DOB(7001, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(7002, "password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    INVALID_PHONE(7003, "phone number is invalid", HttpStatus.BAD_REQUEST),
    INVALID_EMAIL(7004, "email is invalid", HttpStatus.BAD_REQUEST),

    UNAUTHENTICATED(8001, "unauthenticated user", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(8002, "unauthorized", HttpStatus.FORBIDDEN),
    INVALID_KEY(8003, "invalid key", HttpStatus.BAD_REQUEST),

    UNCATEGORIZED_EXCEPTION(9999, "unknown error", HttpStatus.INTERNAL_SERVER_ERROR),

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
