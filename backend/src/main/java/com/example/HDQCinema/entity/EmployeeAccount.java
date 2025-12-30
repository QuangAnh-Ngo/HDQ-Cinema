package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder // Bắt buộc dùng SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmployeeAccount extends Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "employee_account_id")
    String employeeAccountId;

    @Column(unique = true)
    String email;

    @OneToOne
    @JoinColumn(name = "employee_id", nullable = false)
    Employee employee;
}