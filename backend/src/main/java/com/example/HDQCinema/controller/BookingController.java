package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

    @PostMapping
    ApiResponse<BookingResponse> bookSeats(@RequestBody BookingRequest request){
        var response = bookingService.holdSeats(request);

        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @PostMapping("/{bookingId}")
    ApiResponse<String> approvePay(@PathVariable("bookingId")String bookingId) {
        bookingService.approvePayment(bookingId);
        return ApiResponse.<String>builder()
                .result("success")
                .build();
    }
}
