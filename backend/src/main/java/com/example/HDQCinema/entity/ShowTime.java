package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;

import javax.management.ConstructorParameters;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowTime {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
            @Column(name = "showtime_id")
    String id;

    private LocalDateTime startTime; // ngày + giờ chiếu


    // Nhiều suất chiếu thuộc về 1 phim
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false) // khóa ngoại
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false) // khóa ngoại
    private Room room;

    @OneToMany(mappedBy = "showTime", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Booking> booking;
    @OneToMany(mappedBy = "showTime", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<BookingSeat> bookingSeats;

//    public ShowTime(LocalDateTime startTime) {
//        this.startTime = startTime;
//    }
}
