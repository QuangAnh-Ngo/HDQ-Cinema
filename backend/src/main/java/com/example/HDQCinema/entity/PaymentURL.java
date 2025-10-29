package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PaymentURL {
    @Id
//    @Lob
//    @Column(columnDefinition = "TEXT")
    @Column(length = 2048)
    String url;

    @Column(nullable = false)
    double amount;

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    Booking booking;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    Member member;
}
