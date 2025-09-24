package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.ShowTime;
import com.example.HDQCinema.mapper.ShowTimeMapper;
import com.example.HDQCinema.repository.MovieRepository;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ShowTimeService {
    ShowTimeRepository showTimeRepository;
    ShowTimeMapper showTimeMapper;
    RoomRepository roomRepository;
    MovieRepository movieRepository;

    public ShowTimeResponse create(ShowTimeRequest request){
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(()-> new RuntimeException("movie not exist"));

        for(var showTimeRoom : request.getShowTimeRooms()){
            Room room = roomRepository.findById(showTimeRoom.getRoomId())
                    .orElseThrow(()-> new RuntimeException("room not exist"));
            ShowTime showTime = showTimeMapper.toShowTime(movie, room, showTimeRoom.getShowTime());
            showTimeRepository.save(showTime);
        }

        return ShowTimeResponse.builder()
                .message("success")
                .build();
    }
}
