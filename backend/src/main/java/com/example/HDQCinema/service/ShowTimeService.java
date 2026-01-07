package com.example.HDQCinema.service;

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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    public List<ShowTimeResponse> create(ShowTimeRequest request){
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(()-> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        List<ShowTime> showTimes = new ArrayList<>();

        for(var showTimeRoom : request.getShowTimeRooms()){
            Room room = roomRepository.findById(showTimeRoom.getRoomId())
                    .orElseThrow(()-> new AppException(ErrorCode.ROOM_NOT_EXISTED));

            ShowTime showTime = showTimeMapper.toShowTime(movie, room, showTimeRoom.getShowTime());
            showTimes.add(showTime);
            showTimeRepository.save(showTime);

        }

        return showTimeMapper.toResponses(showTimes);

    }

    public ShowTimeResponse update(Long showtimeId, ShowTimeUpdateRequest request){
        ShowTime showTime = showTimeRepository.findShowTimesById(showtimeId);

        // Thêm null check
        if (showTime == null) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }

        if(request.getMovieId() != null){
            Movie movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(()-> new AppException(ErrorCode.MOVIE_NOT_FOUND));
            showTime.setMovie(movie);
        }

        if (request.getShowTimeRooms() != null && !request.getShowTimeRooms().isEmpty()) {
            for(var showTimeRoom : request.getShowTimeRooms()){
                if(showTimeRoom.getRoomId() != null) {
                    Room room = roomRepository.findById(showTimeRoom.getRoomId())
                            .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXISTED));
                    showTime.setRoom(room);
                }
                if(showTimeRoom.getShowTime() != null) showTime.setStartTime(showTimeRoom.getShowTime());
            }
        }

        showTimeRepository.save(showTime);

        return showTimeMapper.toResponse(showTime);
    }

    public void delete(Long showtimeId){
        // Thêm check tồn tại trước khi xóa
        if (!showTimeRepository.existsById(showtimeId)) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }
        showTimeRepository.deleteById(showtimeId);
    }

    public List<ShowTimeResponse> getAll(){
        return showTimeMapper.toResponses(showTimeRepository.findAll());
    }

    // Phân trang và tìm kiếm showtime
    public PageResponse<ShowTimeResponse> getShowTimesPaged(int page, int size, String keyword, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "id");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ShowTime> showTimePage = showTimeRepository.searchShowTimes(keyword, pageable);

        List<ShowTimeResponse> showTimeResponses = showTimeMapper.toResponses(showTimePage.getContent());

        return PageResponse.<ShowTimeResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .data(showTimeResponses)
                .build();
    }

    // Phân trang và tìm kiếm showtime với filter date và status
    public PageResponse<ShowTimeResponse> getShowTimesPaged(int page, int size, String keyword,
            String sortBy, String sortDir, java.time.LocalDate filterDate, String status) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy != null ? sortBy : "startTime");
        Pageable pageable = PageRequest.of(page, size, sort);

        // Sử dụng query mới với filter
        Page<ShowTime> showTimePage = showTimeRepository.searchShowTimesWithFilters(keyword, filterDate, status, pageable);

        List<ShowTimeResponse> showTimeResponses = showTimeMapper.toResponses(showTimePage.getContent());

        return PageResponse.<ShowTimeResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .data(showTimeResponses)
                .build();
    }

    // Lấy suất chiếu trong 7 ngày tới với phân trang
    public PageResponse<ShowTimeResponse> getShowTimesNext7DaysPaged(int page, int size, Long cinemaId, Long movieId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(7);

        Pageable pageable = PageRequest.of(page, size);
        Page<ShowTime> showTimePage = showTimeRepository.findShowTimesInDateRange(now, endDate, cinemaId, movieId, pageable);

        List<ShowTimeResponse> showTimeResponses = showTimeMapper.toResponses(showTimePage.getContent());

        return PageResponse.<ShowTimeResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(showTimePage.getTotalElements())
                .totalPages(showTimePage.getTotalPages())
                .data(showTimeResponses)
                .build();
    }

    // Lấy tất cả suất chiếu trong 7 ngày tới (không phân trang - cho frontend ScheduleModal)
    public List<ShowTimeResponse> getShowTimesNext7Days(Long cinemaId, Long movieId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(7);

        List<ShowTime> showTimes = showTimeRepository.findShowTimesInDateRangeList(now, endDate, cinemaId, movieId);

        return showTimeMapper.toResponses(showTimes);
    }

    // Đếm số lượng suất chiếu trong 7 ngày tới
    public long countShowTimesNext7Days(Long cinemaId, Long movieId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endDate = now.plusDays(7);

        return showTimeRepository.countShowTimesInDateRange(now, endDate, cinemaId, movieId);
    }

    // Tìm showtime theo startTime và roomId
    public ShowTimeResponse getShowTimeByStartTimeAndRoom(LocalDateTime startTime, Long roomId) {
        ShowTime showTime = showTimeRepository.findByStartTimeAndRoomId(startTime, roomId);
        if (showTime == null) {
            throw new AppException(ErrorCode.SHOWTIME_NOT_FOUND);
        }
        return showTimeMapper.toResponse(showTime);
    }
}
