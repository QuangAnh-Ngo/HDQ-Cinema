package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.request.MovieUpdateRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring",
        uses = {ShowTimeMapper.class, ShowTimeAndRoomMapper.class}
        , nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) // có thể lấy phg thức trong ShowTimeMapper và ShowTimeAndRoomMapper ra để sử dụng

public interface MovieMapper {
    Movie toMovie(MovieCreationRequest request);
    MovieResponse toMovieResponse(Movie movie);
    List<MovieResponse> toMovieResponses(List<Movie> movies);
    @Mapping(target = "showtimes", ignore = true)
    void updateMovie(@MappingTarget Movie movie, MovieUpdateRequest request);
}
