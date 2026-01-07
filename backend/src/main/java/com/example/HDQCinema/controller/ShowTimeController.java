// backend/src/main/java/com/example/HDQCinema/controller/ShowTimeController.java
package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.ShowTimeFilterRequest;
import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.PageResponse;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.service.ShowTimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
public class ShowTimeController {
    
    private final ShowTimeService showTimeService;

    // ✅ NEW: Paginated search with filters (Main endpoint for admin)
    @GetMapping("/search")
    public ApiResponse<PageResponse<ShowTimeResponse>> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "startTime") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        ShowTimeFilterRequest filter = ShowTimeFilterRequest.builder()
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDir(sortDir)
                .movieId(movieId)
                .cinemaId(cinemaId)
                .roomId(roomId)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .status(status)
                .search(search)
                .build();

        return ApiResponse.<PageResponse<ShowTimeResponse>>builder()
                .result(showTimeService.search(filter))
                .build();
    }

    // ✅ NEW: Get statistics
    @GetMapping("/statistics")
    public ApiResponse<Map<String, Long>> getStatistics() {
        return ApiResponse.<Map<String, Long>>builder()
                .result(showTimeService.getStatistics())
                .build();
    }

    // ✅ NEW: Get by ID
    @GetMapping("/{showtimeId}")
    public ApiResponse<ShowTimeResponse> getById(@PathVariable Long showtimeId) {
        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTimeService.getById(showtimeId))
                .build();
    }

    // ✅ NEW: Get upcoming by movie (for user schedule modal)
    @GetMapping("/movie/{movieId}")
    public ApiResponse<List<ShowTimeResponse>> getByMovie(@PathVariable Long movieId) {
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getUpcomingByMovie(movieId))
                .build();
    }

    // ✅ NEW: Get upcoming by cinema
    @GetMapping("/cinema/{cinemaId}")
    public ApiResponse<List<ShowTimeResponse>> getByCinema(@PathVariable Long cinemaId) {
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getUpcomingByCinema(cinemaId))
                .build();
    }

    // ✅ Legacy: Get all (deprecated - giữ lại để tương thích)
    @GetMapping
    public ApiResponse<List<ShowTimeResponse>> getAll() {
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.getAll())
                .build();
    }

    // Create
    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    public ApiResponse<List<ShowTimeResponse>> create(@RequestBody ShowTimeRequest request) {
        return ApiResponse.<List<ShowTimeResponse>>builder()
                .result(showTimeService.create(request))
                .build();
    }

    // Update
    @PutMapping("/{showtimeId}")
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    public ApiResponse<ShowTimeResponse> update(
            @PathVariable Long showtimeId,
            @RequestBody ShowTimeUpdateRequest request
    ) {
        return ApiResponse.<ShowTimeResponse>builder()
                .result(showTimeService.update(showtimeId, request))
                .build();
    }

    // Delete
    @DeleteMapping("/{showtimeId}")
    @PreAuthorize("hasAuthority('MANAGE_SHOWTIMES')")
    public ApiResponse<String> delete(@PathVariable Long showtimeId) {
        showTimeService.delete(showtimeId);
        return ApiResponse.<String>builder()
                .result("Deleted successfully")
                .build();
    }
}