package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.MemberUpdateRequest;
import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.request.MovieUpdateRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring",
        uses = {ShowTimeMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)

public interface MovieMapper {
    Movie toMovie(MovieCreationRequest request);

    // Custom mapping để chuyển đổi Movie sang MovieResponse với danh sách showtimes đúng
    default MovieResponse toMovieResponse(Movie movie) {
        if (movie == null) {
            return null;
        }

        MovieResponse.MovieResponseBuilder builder = MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .poster(movie.getPoster())
                .duration(movie.getDuration())
                .limitAge(movie.getLimitAge())
                .dayStart(movie.getDayStart())
                .dayEnd(movie.getDayEnd())
                .director(movie.getDirector())
                .genre(movie.getGenre())
                .description(movie.getDescription())
                .trailer_url(movie.getTrailer_url());

        // Map showtimes - mỗi showtime có ID riêng
        if (movie.getShowtimes() != null) {
            List<ShowTimeResponse> showtimeResponses = movie.getShowtimes().stream()
                    .map(this::mapShowTime)
                    .collect(Collectors.toList());
            builder.showtimes(showtimeResponses);
        }

        return builder.build();
    }

    // Helper method để map từng ShowTime - sử dụng getRoomName()
    default ShowTimeResponse mapShowTime(ShowTime showTime) {
        if (showTime == null) {
            return null;
        }

        ShowTimeResponse.ShowTimeResponseBuilder builder = ShowTimeResponse.builder()
                .showtimeId(showTime.getId())
                .movieId(showTime.getMovie() != null ? showTime.getMovie().getId() : null)
                .movieTitle(showTime.getMovie() != null ? showTime.getMovie().getTitle() : null)
                .startTime(showTime.getStartTime());

        if (showTime.getRoom() != null) {
            builder.roomId(showTime.getRoom().getId())
                   .roomName(showTime.getRoom().getRoomName());

            if (showTime.getRoom().getCinema() != null) {
                builder.cinemaId(showTime.getRoom().getCinema().getId())
                       .cinemaName(showTime.getRoom().getCinema().getName());
            }
        }

        return builder.build();
    }

    default List<MovieResponse> toMovieResponses(List<Movie> movies) {
        if (movies == null) {
            return null;
        }
        return movies.stream()
                .map(this::toMovieResponse)
                .collect(Collectors.toList());
    }

    @Mapping(target = "showtimes", ignore = true)
    void updateMovie(@MappingTarget Movie movie, MovieUpdateRequest request);
}
