package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Movie;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {


    @EntityGraph(attributePaths = {"showtimes.room"})
    @Query("select m from Movie m join Room r on r.cinema.id = ?2 where m.dayStart > ?1")
    List<Movie> findAllByDayStartAfter(LocalDate dayStartAfter, Long cinemaId);


    @EntityGraph(attributePaths = {"showtimes.room"})
    @Query("""
	select distinct m
	from Movie m
	join fetch m.showtimes st
	join fetch st.room r
	where r.cinema.id = :cinemaId
	and :date between m.dayStart and m.dayEnd
	""")
	List<Movie> findShowingMovie(
	    @Param("date") LocalDate date,
	    @Param("cinemaId") Long cinemaId
	);

    Movie findMovieById(Long id);
    //join Cinema c on c.id = ?2

    @EntityGraph(attributePaths = {"showtimes.room"})
    List<Movie> findAll();
}
