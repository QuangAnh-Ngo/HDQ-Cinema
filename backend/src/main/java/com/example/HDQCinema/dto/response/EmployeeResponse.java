package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.dto.Views;
import com.example.HDQCinema.enums.Position;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class EmployeeResponse {
    @JsonView(Views.Public.class)
    Position position;

    @JsonView(Views.Public.class)
    String firstName;

    @JsonView(Views.Public.class)
    String lastName;

    @JsonView(Views.Internal.class)
    @Column(unique = true)
    String phone;

    @JsonView(Views.Internal.class)
    @Column(unique = true)
    String email;
}
