package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.ShowTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface ShowTimeRepository extends JpaRepository<ShowTime, String> {

    @Query(value = "select st.* " +
            "from show_time st " +
            "inner join movie m " +
            "on st.movie_id = m.movie_id " +
            "where m.movie_id = :movie_id " +
            "order by st.start_time;",
    nativeQuery = true)

    List<ShowTime> toShowTimes(@Param("movie_id") String movieId);


    @Transactional
    @Modifying
    @Query("delete from ShowTime s where s.startTime < ?1")
    void deleteShowTimeByStartTimeIsLessThan(LocalDateTime startTimeIsLessThan);
}
