package com.example.HDQCinema.dto.request;

import com.example.HDQCinema.validator.dob.DobConstraint;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class MemberCreationRequest {
    String username;
    String password;
    String email;
    String phoneNumber;
    String firstName;
    String lastName;

    @DobConstraint(min = 16, message = "INVALID_DOB")
    LocalDate dob;
}
