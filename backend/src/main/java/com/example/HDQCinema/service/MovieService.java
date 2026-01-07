package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.MovieCreationRequest;
import com.example.HDQCinema.dto.request.MovieUpdateRequest;
import com.example.HDQCinema.dto.response.MovieResponse;
import com.example.HDQCinema.dto.response.PageResponse;
import com.example.HDQCinema.entity.Movie;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.MovieMapper;
import com.example.HDQCinema.repository.MovieRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class MovieService {

    MovieRepository movieRepository;
    MovieMapper movieMapper;


    public MovieResponse create(MovieCreationRequest request){
        Movie movie = movieMapper.toMovie(request);

        movie = movieRepository.save(movie); // sau lệnh này thì id mới đc tạo

        return movieMapper.toMovieResponse(movie);
    }

    public MovieResponse get(Long id){
        validInput(id);

        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        return movieMapper.toMovieResponse(movie);
    }

    private void validInput(Long id){
        if(id == null || id <= 0){
            throw new RuntimeException("invalid input");
        }
    }

    public List<MovieResponse> getMovieUpComing(Long cinemaId){
        var movies = movieRepository.findAllByDayStartAfter(LocalDate.now(), cinemaId);
        return movieMapper.toMovieResponses(movies);
    }

    public List<MovieResponse> getMoviesShowing(Long cinemaId){
        var movies = movieRepository.findShowingMovie(LocalDate.now(), cinemaId);
        return movieMapper.toMovieResponses(movies);
    }

    public List<MovieResponse> getAll(){
        return movieMapper.toMovieResponses(movieRepository.findAll());
    }

    public PageResponse<MovieResponse> getMoviesPaged(int page, int size, String keyword, String genre,
            Integer limitAge, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Movie> moviePage = movieRepository.searchMovies(keyword, genre, limitAge, pageable);

        List<MovieResponse> movieResponses = movieMapper.toMovieResponses(moviePage.getContent());

        return PageResponse.<MovieResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(moviePage.getTotalElements())
                .totalPages(moviePage.getTotalPages())
                .data(movieResponses)
                .build();
    }

    public MovieResponse update(Long movieId, MovieUpdateRequest request){
        Movie movie = movieRepository.findMovieById(movieId);

        movieMapper.updateMovie(movie, request);

        movie = movieRepository.save(movie); // sau lệnh này thì id mới đc tạo

        return movieMapper.toMovieResponse(movie);
    }

    public void deleteMovie(Long movieId){
        movieRepository.deleteById(movieId);
    }
}
