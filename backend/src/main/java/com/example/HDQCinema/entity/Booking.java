package com.example.HDQCinema.entity;

import com.example.HDQCinema.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "booking_id")
    String id;
    double totalPrice;
    LocalDateTime createTime;

    @Enumerated(EnumType.STRING)
    BookingStatus bookingStatus;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    Member member;

//    @ManyToOne
//    @JoinColumn(name = "showtime_id", nullable = false)
//    ShowTime showTime;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<BookingDetail> bookingDetails;
}
