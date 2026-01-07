package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.EmployeeAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeAccountRepository extends JpaRepository<EmployeeAccount, String> {
    Optional<EmployeeAccount> findByUsername(String username);

    @Query("SELECT ea FROM EmployeeAccount ea WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(ea.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(ea.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(ea.employee.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(ea.employee.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<EmployeeAccount> searchEmployeeAccounts(@Param("keyword") String keyword, Pageable pageable);

}
