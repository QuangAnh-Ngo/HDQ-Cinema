package com.example.HDQCinema.dto.request;

import com.example.HDQCinema.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeAccountUpdateRequest {
    String password;

    List<String> roles;
    String employee;
}
