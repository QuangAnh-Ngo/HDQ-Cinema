package com.example.HDQCinema.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
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
    Integer limitAge;

    @OneToMany(mappedBy = "movie",//Bên Showtime giữ khóa ngoại movie_id.
            cascade = CascadeType.ALL,//Mọi thao tác (lưu, xóa, update) trên Movie sẽ tự động lan xuống Showtimes.
            orphanRemoval = true) //Nếu bạn bỏ một Showtime ra khỏi danh sách, nó sẽ bị xóa luôn trong DB.
    //Một Movie có nhiều Showtime.

    Set<ShowTime> showtimes;
}
