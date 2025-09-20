package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {
    List<Room> findByRoomNameIn(List<String> roomNames);
}
