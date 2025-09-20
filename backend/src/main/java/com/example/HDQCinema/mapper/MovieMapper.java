package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface MovieMapper {
    @Mapping(target = "showtimes", ignore = true)
    Movie toMovie(MovieCreationRequest request);
    MovieResponse toMovieResponse(Movie movie);

}
