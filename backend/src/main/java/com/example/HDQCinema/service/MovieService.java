package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.ShowTime;
import com.example.HDQCinema.mapper.MovieMapper;
import com.example.HDQCinema.mapper.ShowTimeAndRoomMapper;
import com.example.HDQCinema.mapper.ShowTimeMapper;
import com.example.HDQCinema.repository.MovieRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class MovieService {

    MovieRepository movieRepository;
    MovieMapper movieMapper;
    ShowTimeAndRoomMapper showTimeAndRoomMapper;
    ShowTimeRepository showTimeRepository;

    public MovieResponse create(MovieCreationRequest request){
        Movie movie = movieMapper.toMovie(request);

        movie = movieRepository.save(movie); // sau lệnh này thì id mới đc tạo

        return movieMapper.toMovieResponse(movie);
    }

    public MovieResponse get(String id){
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("movie not exist"));

        var showTimes = showTimeRepository.toShowTimes(id);

        var response = movieMapper.toMovieResponse(movie);

        response.setShowtimes(showTimeAndRoomMapper.toShowTimeAndRooms(showTimes));

        return response;
    }

}
