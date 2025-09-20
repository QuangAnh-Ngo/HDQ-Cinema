package com.example.HDQCinema.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

@JsonInclude(JsonInclude.Include.NON_NULL) // khai bao cho json la khi đổi object sang json thi field nao null se dc bo di
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T>{
    private int code = 1000;
    private String message;
    private T result;
}
