package com.example.HDQCinema.exception;

import com.example.HDQCinema.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.xml.bind.ValidationException;
import lombok.Builder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.Objects;

@ControllerAdvice
@Builder
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handleAppException(AppException ex) throws AppException {
        ErrorCode errorCode = ex.getErrorCode();

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(ex.getErrorCode().getCode());
        apiResponse.setMessage(ex.getErrorCode().getMessage());

        return ResponseEntity
                .status(errorCode.getStatusCode())
                .body(apiResponse);
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse> handleException(RuntimeException ex) throws Exception{
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(apiResponse);
    }

    @ExceptionHandler(value = AccessDeniedException.class)
    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;

        return ResponseEntity.status(errorCode.getStatusCode())
                .body(ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse> handlingValidation(MethodArgumentNotValidException exception) {
        // 1. Lấy key lỗi (VD: "INVALID_DOB", "INVALID_EMAIL")
        String enumKey = exception.getFieldError().getDefaultMessage();

        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String, Object> attributes = null;

        try {
            // 2. Tìm ErrorCode từ Enum
            errorCode = ErrorCode.valueOf(enumKey);

            // 3. Unwrap để lấy thông tin chi tiết từ Annotation (min, max, value...)
            var constraintViolation = exception.getBindingResult()
                    .getAllErrors().getFirst()
                    .unwrap(ConstraintViolation.class);

            attributes = constraintViolation.getConstraintDescriptor().getAttributes();

        } catch (IllegalArgumentException e) {
            // Nếu message không khớp với Enum nào, giữ nguyên errorCode mặc định hoặc xử lý riêng
        }

        // 4. Map message động
        String message = Objects.nonNull(attributes)
                ? mapAttribute(errorCode.getMessage(), attributes)
                : errorCode.getMessage();

        ApiResponse apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(apiResponse);
    }

    // --- HÀM QUAN TRỌNG NHẤT ---
    private String mapAttribute(String message, Map<String, Object> attributes) {
        String result = message;

        // Quét qua TẤT CẢ các thuộc tính trong Annotation
        for (Map.Entry<String, Object> entry : attributes.entrySet()) {
            // Tạo placeholder dạng {key}, ví dụ: {min}, {max}, {value}
            String value = String.valueOf(entry.getValue());
            String placeholder = "{" + entry.getKey() + "}";

            // Nếu trong message của ErrorCode có chứa placeholder thì thay thế
            if (result.contains(placeholder)) {
                result = result.replace(placeholder, value);
            }
        }
        return result;
    }
}
