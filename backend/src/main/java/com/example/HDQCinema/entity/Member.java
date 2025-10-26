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
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String userId;

    String username, password, email, phoneNumber;
    LocalDate dob;

    @OneToMany(mappedBy = "member",orphanRemoval = true, cascade = CascadeType.ALL)
    Set<Booking> bookings;
}
