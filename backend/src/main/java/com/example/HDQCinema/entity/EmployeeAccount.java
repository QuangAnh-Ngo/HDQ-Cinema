package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String employeeAccountId;

    String username;
    String password;
    String email;
    String status = "Active";

    LocalDate dayCreated = LocalDate.now();

    @OneToOne
    Employee employee;

    @OneToMany
    Set<Role> roles;
}
