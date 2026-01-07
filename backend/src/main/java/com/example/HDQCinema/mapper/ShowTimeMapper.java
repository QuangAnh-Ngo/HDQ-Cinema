package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShowTimeMapper {

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

    default LocalDateTime toLocalDateTime(ShowTime showTime) {
        return showTime != null ? showTime.getStartTime() : null;
    }

    // Mapping từ ShowTime entity sang ShowTimeResponse - mỗi suất chiếu có ID riêng
    default ShowTimeResponse toResponse(ShowTime showTime) {
        if (showTime == null) {
            return null;
        }

        ShowTimeResponse.ShowTimeResponseBuilder builder = ShowTimeResponse.builder()
                .showtimeId(showTime.getId())
                .startTime(showTime.getStartTime());

        // Map movie info
        if (showTime.getMovie() != null) {
            builder.movieId(showTime.getMovie().getId())
                   .movieTitle(showTime.getMovie().getTitle());
        }

        // Map room info - sử dụng roomName thay vì name
        if (showTime.getRoom() != null) {
            builder.roomId(showTime.getRoom().getId())
                   .roomName(showTime.getRoom().getRoomName());

            // Map cinema info từ room
            if (showTime.getRoom().getCinema() != null) {
                builder.cinemaId(showTime.getRoom().getCinema().getId())
                       .cinemaName(showTime.getRoom().getCinema().getName());
            }
        }

        return builder.build();
    }

    // Mapping list - mỗi phần tử trong list có ID riêng
    default List<ShowTimeResponse> toResponses(List<ShowTime> showTimes) {
        if (showTimes == null) {
            return null;
        }
        return showTimes.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    default ShowTime toShowTime(Movie movie) {
        if (movie == null) {
            return null;
        }
        return ShowTime.builder()
                .movie(movie)
                .build();
    }
}
