package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.ShowTimeAndRoom;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
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
}
