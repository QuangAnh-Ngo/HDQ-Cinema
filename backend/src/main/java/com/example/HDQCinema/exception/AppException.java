package com.example.HDQCinema.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {

    private ErrorCode errorCode;
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

}
