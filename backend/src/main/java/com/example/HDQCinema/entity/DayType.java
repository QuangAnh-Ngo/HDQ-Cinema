package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class DayType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "day_type", unique = true)
    String dayType;

    LocalDate dayStart;
    LocalDate dayEnd;
    @OneToMany(mappedBy = "dayType", cascade = CascadeType.ALL, orphanRemoval = true)
    List<TicketPrice> ticketPrice;
}
