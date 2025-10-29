package com.example.HDQCinema.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeAccountCreationRequest {
    String username;
    String password;
    String email;
    LocalDate dayCreated;

    List<String> roles;
}
