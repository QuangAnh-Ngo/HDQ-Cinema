package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.PageResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.service.ShowTimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/showtimes")
public class ShowTimeController {
    @Autowired
    ShowTimeService showTimeService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    ApiResponse<List<ShowTimeResponse>> createShowTime(@RequestBody ShowTimeRequest request){
        var showTime = showTimeService.create(request);

        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTime)
                .build();
    }

    @GetMapping
    ApiResponse<List<ShowTimeResponse>> getAllShowTime(){
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getAll())
                .build();
    }

    @GetMapping("/paged")
    ApiResponse<PageResponse<ShowTimeResponse>> getShowTimesPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ApiResponse.<PageResponse<ShowTimeResponse>>builder()
                .result(showTimeService.getShowTimesPaged(page, size, keyword, sortBy, sortDir))
                .build();
    }

    // Lấy suất chiếu trong 7 ngày tới với phân trang (lọc theo cinema và movie)
    @GetMapping("/next-7-days/paged")
    ApiResponse<PageResponse<ShowTimeResponse>> getShowTimesNext7DaysPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId) {
        return ApiResponse.<PageResponse<ShowTimeResponse>>builder()
                .result(showTimeService.getShowTimesNext7DaysPaged(page, size, cinemaId, movieId))
                .build();
    }

    // Lấy tất cả suất chiếu trong 7 ngày tới (không phân trang - cho frontend ScheduleModal)
    @GetMapping("/next-7-days")
    ApiResponse<List<ShowTimeResponse>> getShowTimesNext7Days(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId) {
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getShowTimesNext7Days(cinemaId, movieId))
                .build();
    }

    // Đếm số lượng suất chiếu trong 7 ngày tới
    @GetMapping("/next-7-days/count")
    ApiResponse<Long> countShowTimesNext7Days(
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long movieId) {
        return ApiResponse.<Long>builder()
                .result(showTimeService.countShowTimesNext7Days(cinemaId, movieId))
                .build();
    }

    // Tìm showtime theo startTime và roomId (thay thế việc frontend so sánh thủ công)
    @GetMapping("/find")
    ApiResponse<ShowTimeResponse> getShowTimeByStartTimeAndRoom(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam Long roomId) {
        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTimeService.getShowTimeByStartTimeAndRoom(startTime, roomId))
                .build();
    }

    @DeleteMapping("/{showtimeId}")
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    ApiResponse<String> deleteShowTime(@PathVariable("showtimeId") Long showtimeId){
        showTimeService.delete(showtimeId);
        return ApiResponse.<String>builder()
                .result("deleted").build();

    }
    @PutMapping("/{showtimeId}")
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    ApiResponse<ShowTimeResponse> updateShowTime(@PathVariable("showtimeId") Long showtimeId, @RequestBody ShowTimeUpdateRequest request){
        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTimeService.update(showtimeId, request))
                .build();
    }

}
