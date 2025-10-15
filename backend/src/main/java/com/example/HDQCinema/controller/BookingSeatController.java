package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.BookingSeatResponse;
import com.example.HDQCinema.entity.BookingSeat;
import com.example.HDQCinema.service.BookingSeatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bookingseats")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingSeatController {
    BookingSeatService bookingSeatService;

    @GetMapping("/{showtimeId}")
    ApiResponse<List<BookingSeatResponse>> getAllBookingSeats(@PathVariable("showtimeId")String showtimeId){
        return ApiResponse.<List<BookingSeatResponse>>builder()
                .result(bookingSeatService.getAll(showtimeId))
                .build();
    }
}
