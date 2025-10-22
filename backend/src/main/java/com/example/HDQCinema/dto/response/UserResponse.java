package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.Role;
import jakarta.persistence.ManyToMany;
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
public class UserResponse {
    String userId;

    String username, email, phoneNumber;
    LocalDate dob;

    Set<Object> roles;
}
