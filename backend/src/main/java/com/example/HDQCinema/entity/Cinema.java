package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cinema {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cinema_id")
    String id;

    String name;
    String city;
    String district;
    String address;

    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Room> rooms;

    @OneToMany(mappedBy = "cinema", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<TicketPrice> ticketPrices;
}
