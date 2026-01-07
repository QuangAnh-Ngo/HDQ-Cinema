// backend/src/main/java/com/example/HDQCinema/repository/ShowTimeRepository.java
package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShowTimeRepository extends JpaRepository<ShowTime, Long>, JpaSpecificationExecutor<ShowTime> {

    // ✅ Optimized query with JOIN FETCH
    @Query("SELECT st FROM ShowTime st " +
           "JOIN FETCH st.movie m " +
           "JOIN FETCH st.room r " +
           "JOIN FETCH r.cinema c " +
           "WHERE st.id = :id")
    Optional<ShowTime> findByIdWithDetails(@Param("id") Long id);

    // ✅ Get upcoming showtimes for a movie
    @Query("SELECT st FROM ShowTime st " +
           "JOIN FETCH st.movie m " +
           "JOIN FETCH st.room r " +
           "JOIN FETCH r.cinema c " +
           "WHERE m.id = :movieId AND st.startTime > :now " +
           "ORDER BY st.startTime ASC")
    List<ShowTime> findUpcomingByMovieId(@Param("movieId") Long movieId, @Param("now") LocalDateTime now);

    // ✅ Get showtimes by cinema
    @Query("SELECT st FROM ShowTime st " +
           "JOIN FETCH st.movie m " +
           "JOIN FETCH st.room r " +
           "JOIN FETCH r.cinema c " +
           "WHERE c.id = :cinemaId AND st.startTime > :now " +
           "ORDER BY st.startTime ASC")
    List<ShowTime> findUpcomingByCinemaId(@Param("cinemaId") Long cinemaId, @Param("now") LocalDateTime now);

    // ✅ Check existence
    boolean existsByRoomAndStartTime(Room room, LocalDateTime startTime);

    // ✅ For legacy support
    @Query(value = "SELECT st.* FROM show_time st " +
            "INNER JOIN movie m ON st.movie_id = m.movie_id " +
            "WHERE m.movie_id = :movie_id AND st.start_time > NOW() " +
            "ORDER BY st.start_time", nativeQuery = true)
    List<ShowTime> toShowTimes(@Param("movie_id") Long movieId);

    ShowTime findShowTimesById(Long id);
    
    // ✅ FIX: Count upcoming - dùng JPQL với parameter
    @Query("SELECT COUNT(st) FROM ShowTime st WHERE st.startTime > :now")
    long countUpcoming(@Param("now") LocalDateTime now);
    
    // ✅ FIX: Count today - dùng native query vì JPQL không hỗ trợ DATE()
    @Query(value = "SELECT COUNT(*) FROM show_time WHERE DATE(start_time) = CURRENT_DATE", nativeQuery = true)
    long countToday();
}