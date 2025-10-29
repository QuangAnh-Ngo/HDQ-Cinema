package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.TicketPriceRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.TicketPriceResponse;
import com.example.HDQCinema.service.TicketPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tickets")
public class TicketPriceController {

    @Autowired
    TicketPriceService ticketPriceService;

    @PostMapping
    ApiResponse<TicketPriceResponse> createTicket(@RequestBody TicketPriceRequest request) {
        var response = ticketPriceService.create(request);
        return ApiResponse.<TicketPriceResponse>builder()
                .result(response)
                .build();
    }
}
