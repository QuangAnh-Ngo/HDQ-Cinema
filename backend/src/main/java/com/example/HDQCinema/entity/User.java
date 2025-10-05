package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String username, password, email, phoneNumber;
    LocalDate dob;

//    @ManyToMany
//    Set<Role> roles;

    @OneToMany(mappedBy = "user" ,orphanRemoval = true, cascade = CascadeType.ALL)
    Set<Booking> bookings;
}
