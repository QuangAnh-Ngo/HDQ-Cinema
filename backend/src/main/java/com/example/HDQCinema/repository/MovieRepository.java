package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Movie;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, String> {


    @EntityGraph(attributePaths = {"showtimes.room"})
    @Query("select m from Movie m join Room r on r.cinema.id = ?2 where m.dayStart > ?1")
    List<Movie> findAllByDayStartAfter(LocalDate dayStartAfter, String cinemaId);


    @EntityGraph(attributePaths = {"showtimes.room"})
    @Query("select m from Movie m join Room r on r.cinema.id = ?2 where m.dayEnd > ?1 and m.dayStart < ?1")
    List<Movie> findShowingMovie(LocalDate dayEndBefore, String cinemaId);

    Movie findMovieById(String id);
    //join Cinema c on c.id = ?2

    @EntityGraph(attributePaths = {"showtimes.room"})
    List<Movie> findAll();
}
