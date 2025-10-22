package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.DayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DayTypeRepository extends JpaRepository<DayType, String> {

    @Query("select d from DayType d where d.dayType = ?1")
    Optional<Object> findDayTypeByDayType(String dayType);
}
