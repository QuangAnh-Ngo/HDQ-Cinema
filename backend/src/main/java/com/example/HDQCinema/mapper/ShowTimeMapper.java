// backend/src/main/java/com/example/HDQCinema/mapper/ShowTimeMapper.java
package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShowTimeMapper {

    // ✅ Create ShowTime entity
    default ShowTime toShowTime(Movie movie, Room room, LocalDateTime time) {
        if (movie == null && room == null && time == null) {
            return null;
        }
        return ShowTime.builder()
                .startTime(time)
                .room(room)
                .movie(movie)
                .build();
    }

    // ✅ Convert to flattened response
    default ShowTimeResponse toResponse(ShowTime showTime) {
        if (showTime == null) return null;

        Movie movie = showTime.getMovie();
        Room room = showTime.getRoom();
        
        String status = calculateStatus(showTime.getStartTime());
        
        return ShowTimeResponse.builder()
                .showtimeId(showTime.getId())
                // Movie
                .movieId(movie != null ? movie.getId() : null)
                .movieTitle(movie != null ? movie.getTitle() : null)
                .moviePoster(movie != null ? movie.getPoster() : null)
                .movieDuration(movie != null ? movie.getDuration() : null)
                // Room
                .roomId(room != null ? room.getId() : null)
                .roomName(room != null ? room.getRoomName() : null)
                // Cinema
                .cinemaId(room != null && room.getCinema() != null ? room.getCinema().getId() : null)
                .cinemaName(room != null && room.getCinema() != null ? room.getCinema().getName() : null)
                // Time
                .startTime(showTime.getStartTime())
                .date(showTime.getStartTime() != null ? 
                      showTime.getStartTime().format(DateTimeFormatter.ISO_LOCAL_DATE) : null)
                .time(showTime.getStartTime() != null ? 
                      showTime.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")) : null)
                // Status
                .status(status)
                .build();
    }

    // ✅ Convert list
    default List<ShowTimeResponse> toResponses(List<ShowTime> showTimes) {
        if (showTimes == null) return List.of();
        return showTimes.stream().map(this::toResponse).toList();
    }

    // ✅ Calculate status
    default String calculateStatus(LocalDateTime startTime) {
        if (startTime == null) return "unknown";
        
        LocalDateTime now = LocalDateTime.now();
        
        if (startTime.isAfter(now)) {
            return "upcoming";
        }
        
        // Active if within 3 hours of start
        LocalDateTime threeHoursLater = startTime.plusHours(3);
        if (now.isBefore(threeHoursLater)) {
            return "active";
        }
        
        return "ended";
    }
}