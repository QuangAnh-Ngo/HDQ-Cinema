package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowTime {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    private LocalDateTime startTime; // ngày + giờ chiếu

    // Nhiều suất chiếu thuộc về 1 phim
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false) // khóa ngoại
    private Movie movie;
}

