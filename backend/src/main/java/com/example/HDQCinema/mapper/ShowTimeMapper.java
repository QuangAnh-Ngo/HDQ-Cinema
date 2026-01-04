package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.MovieUpdateRequest;
import com.example.HDQCinema.dto.request.ShowTimeAndRoom;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShowTimeMapper {
//    default ShowTime toShowTime(LocalDateTime time){
//        if (time == null) {
//            return null;
//        } else {
//            ShowTime.ShowTimeBuilder showTime = ShowTime.builder().startTime(time);
//            return showTime.build();
//        }
//    }
//    List<ShowTime> toShowTimes(List<LocalDateTime> time);
//    ShowTimeResponse toShowTimeResponse(ShowTime showTime);
//    ShowTimeResponse toResponses(List<ShowTime> showTimes);

    default ShowTime toShowTime(Movie movie, Room room, LocalDateTime time) {
        if (movie == null && room == null && time == null) {
            return null;
        } else {
            ShowTime.ShowTimeBuilder showTime = ShowTime.builder()
                    .startTime(time)
                    .room(room)
                    .movie(movie);

            return showTime.build();
        }
    }

    default LocalDateTime toLocalDateTime(ShowTime showTime) {
        return showTime != null ? showTime.getStartTime() : null;
    }

    List<ShowTimeResponse> toResponses(List<ShowTime> showTimes);

    default ShowTimeResponse toResponse(ShowTime showTime) {
        if (showTime == null) {
            return null;
        }
        else {
            ShowTimeAndRoom showTimeAndRoom = ShowTimeAndRoom.builder()
                    .showTime(showTime.getStartTime())
                    .roomId(showTime.getRoom().getId()).build();

            ShowTimeResponse.ShowTimeResponseBuilder showTimeResponse = ShowTimeResponse.builder()
                    .showTimeRooms(List.of(showTimeAndRoom))
                    .movieId(showTime.getMovie().getId())
                    .showtimeId(showTime.getId())
                    ;

            return showTimeResponse.build();
        }

    }
    default ShowTime toShowTime(Movie movie) {
        if (movie == null) {
            return null;
        } else {
            ShowTime.ShowTimeBuilder showTime = ShowTime.builder()
                    .movie(movie);

            return showTime.build();
        }
    }


}
