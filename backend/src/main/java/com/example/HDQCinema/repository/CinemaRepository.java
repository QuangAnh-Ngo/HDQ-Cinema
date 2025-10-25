package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Cinema;
import com.example.HDQCinema.entity.Room;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, String> {

    @EntityGraph(attributePaths = {"rooms.cinema"}, type = EntityGraph.EntityGraphType.LOAD)
    @Query("select c from Cinema c")
    List<Cinema> findAll();
}
