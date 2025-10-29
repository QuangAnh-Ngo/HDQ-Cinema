package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public class EmployeeAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String employeeAccountId;

    String username;
    String password;
    String email;
    String status = "Active";

    @CreatedDate
    @Column(nullable = false, updatable = false)
    LocalDateTime dayCreated;

    @OneToOne
    Employee employee;

    @OneToMany
    Set<Role> roles;
}
