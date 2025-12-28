package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.Position;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "employee_id")
    String employeeId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Position position = Position.EMPLOYEE;

    String firstName;
    String lastName;

    @Column(unique = true)
    String phone;

    @Column(unique = true)
    String email;
}
