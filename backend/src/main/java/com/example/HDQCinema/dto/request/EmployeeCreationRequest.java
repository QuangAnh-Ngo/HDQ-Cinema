package com.example.HDQCinema.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeCreationRequest {
    String firstName;
    String lastName;

    @Size(min = 10, message = "INVALID_PHONE")
    String phone;

    @Email(message = "INVALID_EMAIL")
    String email;
}
