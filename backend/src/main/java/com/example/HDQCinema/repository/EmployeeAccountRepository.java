package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeAccountRepository extends JpaRepository<EmployeeAccount, String> {
    Optional<EmployeeAccount> findByUsername(String username);

}
