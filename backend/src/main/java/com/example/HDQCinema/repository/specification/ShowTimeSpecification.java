// backend/src/main/java/com/example/HDQCinema/repository/specification/ShowTimeSpecification.java
package com.example.HDQCinema.repository.specification;

import com.example.HDQCinema.dto.request.ShowTimeFilterRequest;
import com.example.HDQCinema.entity.ShowTime;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ShowTimeSpecification {

    public static Specification<ShowTime> withFilters(ShowTimeFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // JOIN để tránh N+1
            if (query.getResultType() != Long.class) {
                root.fetch("movie", JoinType.LEFT);
                root.fetch("room", JoinType.LEFT).fetch("cinema", JoinType.LEFT);
            }

            // Filter by movieId
            if (filter.getMovieId() != null) {
                predicates.add(cb.equal(root.get("movie").get("id"), filter.getMovieId()));
            }

            // Filter by cinemaId
            if (filter.getCinemaId() != null) {
                predicates.add(cb.equal(root.get("room").get("cinema").get("id"), filter.getCinemaId()));
            }

            // Filter by roomId
            if (filter.getRoomId() != null) {
                predicates.add(cb.equal(root.get("room").get("id"), filter.getRoomId()));
            }

            // Filter by date range
            if (filter.getDateFrom() != null) {
                LocalDateTime from = filter.getDateFrom().atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), from));
            }

            if (filter.getDateTo() != null) {
                LocalDateTime to = filter.getDateTo().atTime(23, 59, 59);
                predicates.add(cb.lessThanOrEqualTo(root.get("startTime"), to));
            }

            // Filter by status
            if (filter.getStatus() != null && !filter.getStatus().equals("all")) {
                LocalDateTime now = LocalDateTime.now();
                
                switch (filter.getStatus()) {
                    case "upcoming":
                        predicates.add(cb.greaterThan(root.get("startTime"), now));
                        break;
                    case "active":
                        // Active = started within last 3 hours
                        LocalDateTime threeHoursAgo = now.minusHours(3);
                        predicates.add(cb.between(root.get("startTime"), threeHoursAgo, now));
                        break;
                    case "ended":
                        LocalDateTime threeHoursAgoForEnded = now.minusHours(3);
                        predicates.add(cb.lessThan(root.get("startTime"), threeHoursAgoForEnded));
                        break;
                }
            }

            // Search by movie title, cinema name, room name
            if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                String searchPattern = "%" + filter.getSearch().toLowerCase() + "%";
                Predicate movieTitle = cb.like(cb.lower(root.get("movie").get("title")), searchPattern);
                Predicate cinemaName = cb.like(cb.lower(root.get("room").get("cinema").get("name")), searchPattern);
                Predicate roomName = cb.like(cb.lower(root.get("room").get("roomName")), searchPattern);
                predicates.add(cb.or(movieTitle, cinemaName, roomName));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}