package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingController {
    BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAuthority('BOOKING')")
    ApiResponse<BookingResponse> createBooking(@RequestBody BookingRequest request){
        var response = bookingService.createBooking(request);

        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAuthority('MANAGE_BOOKING') or hasRole('ADMIN')")
    ApiResponse<List<BookingResponse>> getBookingsByDate(@PathVariable("date") LocalDate date){
        var response = bookingService.getBookingsByDate(date);
        return ApiResponse.<List<BookingResponse>>builder()
                .result(response)
                .build();
    }
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAuthority('MANAGE_BOOKING') or #memberId == principal.claims['accountId']")
    ApiResponse<List<BookingResponse>> getBookingsByMember(@PathVariable("memberId") String memberId){
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getBookingsByMember(memberId))
                .build();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('MANAGE_BOOKING') or hasRole('ADMIN')")
    ApiResponse<AmountOfPendingBookingResponse> getAmountOfPending(){
        var response = bookingService.countPendingBooking();
        return ApiResponse.<AmountOfPendingBookingResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('MANAGE_BOOKING') or hasRole('ADMIN')")
    ApiResponse<List<BookingResponse>> getAllBookings(){
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getAll())
                .build();
    }
}
