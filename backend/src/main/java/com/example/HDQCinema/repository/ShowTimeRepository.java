package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowTimeRepository extends JpaRepository<ShowTime, Long> {

    @Query(value = "select st.* " +
            "from show_time st " +
            "inner join movie m " +
            "on st.movie_id = m.movie_id " +
            "where m.movie_id = :movie_id and st.start_time > NOW() " +
            "order by st.start_time;",
    nativeQuery = true)
    List<ShowTime> toShowTimes(@Param("movie_id") Long movieId);

    boolean existsShowTimeByRoomAndStartTime(Room room, LocalDateTime startTime);

    @EntityGraph(attributePaths = {"movie", "room", "room.cinema"})
    ShowTime findShowTimesById(Long id);

    // Phân trang và tìm kiếm showtime - thêm JOIN FETCH để tránh N+1
    @Query("SELECT st FROM ShowTime st " +
            "JOIN FETCH st.movie " +
            "JOIN FETCH st.room r " +
            "JOIN FETCH r.cinema " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(st.movie.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(st.room.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ShowTime> searchShowTimesWithFetch(@Param("keyword") String keyword);

    // Phân trang showtime (countQuery riêng để tránh lỗi với JOIN FETCH)
    @Query(value = "SELECT st FROM ShowTime st " +
            "JOIN FETCH st.movie " +
            "JOIN FETCH st.room r " +
            "JOIN FETCH r.cinema " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(st.movie.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(st.room.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            countQuery = "SELECT COUNT(st) FROM ShowTime st " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(st.movie.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(st.room.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ShowTime> searchShowTimes(@Param("keyword") String keyword, Pageable pageable);

    // Lấy suất chiếu trong khoảng thời gian (7 ngày tới) với phân trang - thêm JOIN FETCH
    @Query(value = "SELECT st FROM ShowTime st " +
            "JOIN FETCH st.movie " +
            "JOIN FETCH st.room r " +
            "JOIN FETCH r.cinema " +
            "WHERE st.startTime >= :startDate AND st.startTime <= :endDate " +
            "AND (:cinemaId IS NULL OR r.cinema.id = :cinemaId) " +
            "AND (:movieId IS NULL OR st.movie.id = :movieId) " +
            "ORDER BY st.startTime ASC",
            countQuery = "SELECT COUNT(st) FROM ShowTime st " +
            "WHERE st.startTime >= :startDate AND st.startTime <= :endDate " +
            "AND (:cinemaId IS NULL OR st.room.cinema.id = :cinemaId) " +
            "AND (:movieId IS NULL OR st.movie.id = :movieId)")
    Page<ShowTime> findShowTimesInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId,
            Pageable pageable);

    // Lấy suất chiếu trong khoảng thời gian (không phân trang) - thêm JOIN FETCH
    @Query("SELECT st FROM ShowTime st " +
            "JOIN FETCH st.movie " +
            "JOIN FETCH st.room r " +
            "JOIN FETCH r.cinema " +
            "WHERE st.startTime >= :startDate AND st.startTime <= :endDate " +
            "AND (:cinemaId IS NULL OR r.cinema.id = :cinemaId) " +
            "AND (:movieId IS NULL OR st.movie.id = :movieId) " +
            "ORDER BY st.startTime ASC")
    List<ShowTime> findShowTimesInDateRangeList(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId);

    // Đếm số lượng suất chiếu trong 7 ngày tới
    @Query("SELECT COUNT(st) FROM ShowTime st WHERE " +
            "st.startTime >= :startDate AND st.startTime <= :endDate " +
            "AND (:cinemaId IS NULL OR st.room.cinema.id = :cinemaId) " +
            "AND (:movieId IS NULL OR st.movie.id = :movieId)")
    long countShowTimesInDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("cinemaId") Long cinemaId,
            @Param("movieId") Long movieId);

    // Tìm showtime theo startTime và roomId - thêm JOIN FETCH
    @Query("SELECT st FROM ShowTime st " +
            "JOIN FETCH st.movie " +
            "JOIN FETCH st.room r " +
            "JOIN FETCH r.cinema " +
            "WHERE st.startTime = :startTime AND r.id = :roomId")
    ShowTime findByStartTimeAndRoomId(
            @Param("startTime") LocalDateTime startTime,
            @Param("roomId") Long roomId);

    // Override findAll để thêm EntityGraph
    @Override
    @EntityGraph(attributePaths = {"movie", "room", "room.cinema"})
    List<ShowTime> findAll();
}
