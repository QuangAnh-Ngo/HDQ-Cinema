package com.example.HDQCinema.repository;

import com.example.HDQCinema.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    Optional<Member> findByUsername(String name);

    @Query("SELECT m FROM Member m WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(m.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.username) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Member> searchMembers(@Param("keyword") String keyword, Pageable pageable);
}
