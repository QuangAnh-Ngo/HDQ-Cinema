package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {
    Optional<Permission> findAllByName(@Param("name") String name);
    Optional<Permission> findByName(@Param("name") String name);
}
