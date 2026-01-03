package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.AccountStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EntityListeners(AuditingEntityListener.class)
public abstract class Account {

    @Column(unique = true, nullable = false)
    String username;

    @Column(nullable = false)
    String password;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    LocalDateTime dayCreated;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    AccountStatus status = AccountStatus.ACTIVE;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;
}