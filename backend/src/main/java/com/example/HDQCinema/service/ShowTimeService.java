// backend/src/main/java/com/example/HDQCinema/service/ShowTimeService.java
package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.ShowTimeFilterRequest;
import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.PageResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.ShowTimeMapper;
import com.example.HDQCinema.repository.MovieRepository;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import com.example.HDQCinema.repository.specification.ShowTimeSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ShowTimeService {
    ShowTimeRepository showTimeRepository;
    ShowTimeMapper showTimeMapper;
    RoomRepository roomRepository;
    MovieRepository movieRepository;

    // ✅ NEW: Paginated search with filters
    public PageResponse<ShowTimeResponse> search(ShowTimeFilterRequest filter) {
        // Build sort
        Sort sort = filter.getSortDir().equalsIgnoreCase("asc") 
                ? Sort.by(filter.getSortBy()).ascending()
                : Sort.by(filter.getSortBy()).descending();

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // Execute query with specification
        Page<ShowTime> page = showTimeRepository.findAll(
                ShowTimeSpecification.withFilters(filter), 
                pageable
        );

        // Convert to response
        List<ShowTimeResponse> content = page.getContent().stream()
                .map(showTimeMapper::toResponse)
                .toList();

        return PageResponse.<ShowTimeResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }

    // ✅ NEW: Get statistics
    public Map<String, Long> getStatistics() {
        LocalDateTime now = LocalDateTime.now();
        Map<String, Long> stats = new HashMap<>();
        
        stats.put("total", showTimeRepository.count());
        stats.put("upcoming", showTimeRepository.countUpcoming(now));
        stats.put("today", showTimeRepository.countToday());
        
        return stats;
    }

    // ✅ Get by ID
    public ShowTimeResponse getById(Long id) {
        ShowTime showTime = showTimeRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));
        return showTimeMapper.toResponse(showTime);
    }

    // ✅ Get upcoming by movie (for user schedule modal)
    public List<ShowTimeResponse> getUpcomingByMovie(Long movieId) {
        List<ShowTime> showTimes = showTimeRepository.findUpcomingByMovieId(movieId, LocalDateTime.now());
        return showTimeMapper.toResponses(showTimes);
    }

    // ✅ Get upcoming by cinema
    public List<ShowTimeResponse> getUpcomingByCinema(Long cinemaId) {
        List<ShowTime> showTimes = showTimeRepository.findUpcomingByCinemaId(cinemaId, LocalDateTime.now());
        return showTimeMapper.toResponses(showTimes);
    }

    // ✅ Create (keep existing logic)
    @Transactional
    public List<ShowTimeResponse> create(ShowTimeRequest request) {
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        
        List<ShowTime> showTimes = new ArrayList<>();

        for (var showTimeRoom : request.getShowTimeRooms()) {
            Room room = roomRepository.findById(showTimeRoom.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXISTED));

            // Check duplicate
            if (showTimeRepository.existsByRoomAndStartTime(room, showTimeRoom.getShowTime())) {
                throw new AppException(ErrorCode.SHOWTIME_EXISTED);
            }

            ShowTime showTime = showTimeMapper.toShowTime(movie, room, showTimeRoom.getShowTime());
            showTimes.add(showTimeRepository.save(showTime));
        }

        return showTimeMapper.toResponses(showTimes);
    }

    // ✅ Update
    @Transactional
    public ShowTimeResponse update(Long showtimeId, ShowTimeUpdateRequest request) {
        ShowTime showTime = showTimeRepository.findByIdWithDetails(showtimeId)
                .orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_FOUND));

        if (request.getMovieId() != null) {
            Movie movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
            showTime.setMovie(movie);
        }

        if (request.getShowTimeRooms() != null && !request.getShowTimeRooms().isEmpty()) {
            var showTimeRoom = request.getShowTimeRooms().get(0); // Take first one
            
            if (showTimeRoom.getRoomId() != null) {
                Room room = roomRepository.findById(showTimeRoom.getRoomId())
                        .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXISTED));
                showTime.setRoom(room);
            }
            
            if (showTimeRoom.getShowTime() != null) {
                showTime.setStartTime(showTimeRoom.getShowTime());
            }
        }

        return showTimeMapper.toResponse(showTimeRepository.save(showTime));
    }

    // ✅ Delete
    @Transactional
    public void delete(Long showtimeId) {
        if (!showTimeRepository.existsById(showtimeId)) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }
        showTimeRepository.deleteById(showtimeId);
    }

    // ✅ Legacy: Get all (không khuyến khích dùng với data lớn)
    @Deprecated
    public List<ShowTimeResponse> getAll() {
        log.warn("⚠️ Using deprecated getAll() - consider using search() with pagination");
        List<ShowTime> showTimes = showTimeRepository.findAll();
        return showTimeMapper.toResponses(showTimes);
    }
}