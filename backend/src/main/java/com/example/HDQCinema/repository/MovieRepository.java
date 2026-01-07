package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    @EntityGraph(attributePaths = {"showtimes.room"})
    @Query("select m from Movie m join Room r on r.cinema.id = ?2 where m.dayStart > ?1")
    List<Movie> findAllByDayStartAfter(LocalDate dayStartAfter, Long cinemaId);

    @EntityGraph(attributePaths = {"showtimes.room"})
    @Query("select m from Movie m join Room r on r.cinema.id = ?2 where m.dayEnd > ?1 and m.dayStart < ?1")
    List<Movie> findShowingMovie(LocalDate dayEndBefore, Long cinemaId);

    Movie findMovieById(Long id);

    @EntityGraph(attributePaths = {"showtimes.room"})
    List<Movie> findAll();

    @Query("SELECT m FROM Movie m WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.director) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:genre IS NULL OR :genre = '' OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :genre, '%'))) " +
            "AND (:limitAge IS NULL OR m.limitAge <= :limitAge)")
    Page<Movie> searchMovies(
            @Param("keyword") String keyword,
            @Param("genre") String genre,
            @Param("limitAge") Integer limitAge,
            Pageable pageable);
}
