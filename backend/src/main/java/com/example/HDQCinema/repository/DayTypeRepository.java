package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.DayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DayTypeRepository extends JpaRepository<DayType, String> {

    Optional<Object> findDayTypeByDayType(String dayType);
}
