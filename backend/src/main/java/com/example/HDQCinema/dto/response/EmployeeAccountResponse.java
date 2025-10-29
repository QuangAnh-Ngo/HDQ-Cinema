package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class EmployeeAccountResponse {
    String employeeAccountId;
    String username;
    String email;

    Set<Role> roles;
}
