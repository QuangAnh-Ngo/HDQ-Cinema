package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "movie_id")
    String id;

    String name, poster;
    Integer duration;
    LocalDate dayStart, dayEnd;

    Integer limitAge;

    @OneToMany(mappedBy = "movie",//Movie “nhìn ngược lại” thông qua mappedBy = "movie" (chính là tên field " private Movie movie; " ở ShowTime).
            cascade = CascadeType.ALL,//Mọi thao tác (lưu, xóa, update) trên Movie sẽ tự động lan xuống Showtimes.
            orphanRemoval = true) //Nếu bạn bỏ một Showtime ra khỏi danh sách, nó sẽ bị xóa luôn trong DB.
    //Một Movie có nhiều Showtime.

    List<ShowTime> showtimes;
}
