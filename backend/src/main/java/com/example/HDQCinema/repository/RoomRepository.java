package com.example.HDQCinema.repository;

import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {

    List<Room> findByRoomNameIn(List<String> roomNames);

    @Query(value = "select r.* " +
            "from room r " +
            "inner join cinema c " +
            "on c.cinema_id = r.cinema_id " +
            "where c.cinema_id = :cinema_id;"
            ,       nativeQuery = true)
    List<Room> findRoomsByCinemaId(@Param("cinema_id") String cinemaId);
}
