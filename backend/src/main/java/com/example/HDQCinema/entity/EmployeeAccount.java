package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.AccountStatus;
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
    @Column(name = "employee_account_id")
    String employeeAccountId;


    String username;
    String password;

    @Column(unique = true)
    String email;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    AccountStatus status = AccountStatus.ACTIVE;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    LocalDateTime dayCreated;

    @OneToOne
    @JoinColumn(
            name = "employee_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_employee_account")
    )
    Employee employee;

    @ManyToMany
    Set<Role> roles;
}
