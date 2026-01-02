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
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MemberUpdateRequest {
    String username;
    String password;
    String email;
    String phoneNumber;

    @DobConstraint(min = 16, message = "INVALID_DOB")
    LocalDate dob;
}
