package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.AmountOfPendingBookingResponse;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    BookingService bookingService;

//    @PostMapping("/seats")
//    ApiResponse<BookingSeatResponse> holdSeats(@RequestBody BookingRequest request){
//        var response = bookingService.holdSeats(request);
//
//        return ApiResponse.<BookingSeatResponse>builder()
//                .result(response)
//                .build();
//    }

    @PostMapping
    ApiResponse<BookingResponse> createBooking(@RequestBody BookingRequest request){
        var response = bookingService.createBooking(request);

        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @PostMapping("/{bookingId}")
    ApiResponse<BookingResponse> approvePay(@PathVariable("bookingId")String bookingId) {
        var response = bookingService.approvePayment(bookingId);
        return ApiResponse.<BookingResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/{bookingId}")
    ApiResponse<Boolean> getConfirmPayment(@PathVariable("bookingId")String bookingId){
        var response = bookingService.getConfirmPayment(bookingId);

        return ApiResponse.<Boolean>builder()
                .result(response)
                .build();
    }

    @GetMapping("/{date}")
    ApiResponse<List<BookingResponse>> getBooking(@PathVariable("date") LocalDate date){
        var response = bookingService.getBookings(date);
        return ApiResponse.<List<BookingResponse>>builder()
                .result(response)
                .build();
    }

    @GetMapping("/pending")
    ApiResponse<AmountOfPendingBookingResponse> getAmountOfPending(){
        var response = bookingService.countPendingBooking();
        return ApiResponse.<AmountOfPendingBookingResponse>builder()
                .result(response)
                .build();
    }
}
