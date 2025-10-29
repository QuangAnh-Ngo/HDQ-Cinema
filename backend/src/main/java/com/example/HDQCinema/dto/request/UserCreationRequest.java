package com.example.HDQCinema.dto.request;



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
public class UserCreationRequest {
    String username, password, email, phoneNumber;
    LocalDate dob;
    List<String> roles;
}
