package com.example.HDQCinema.controller;

import com.example.HDQCinema.dto.request.TicketPriceRequest;
import com.example.HDQCinema.dto.request.TicketPriceUpdateRequest;
import com.example.HDQCinema.dto.response.ApiResponse;
import com.example.HDQCinema.dto.response.TicketPriceResponse;
import com.example.HDQCinema.service.TicketPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
public class TicketPriceController {

    @Autowired
    TicketPriceService ticketPriceService;

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_PRICE')")
    ApiResponse<TicketPriceResponse> createTicket(@RequestBody TicketPriceRequest request) {
        var response = ticketPriceService.create(request);
        return ApiResponse.<TicketPriceResponse>builder()
                .result(response)
                .build();
    }

    @PutMapping("/{ticketPriceId}")
    @PreAuthorize("hasAuthority('MANAGE_PRICE')")
    ApiResponse<TicketPriceResponse> updateTicket(@PathVariable("ticketPriceId") Long ticketPriceId, @RequestBody TicketPriceUpdateRequest request){
        return ApiResponse.<TicketPriceResponse>builder()
                .result(ticketPriceService.update(ticketPriceId, request))
                .build();
    }

    @DeleteMapping("/{ticketPriceId}")
    @PreAuthorize("hasAuthority('MANAGE_PRICE')")
    ApiResponse<String> deleteTicket(@PathVariable("ticketPriceId") Long ticketPriceId){
        ticketPriceService.delete(ticketPriceId);
        return ApiResponse.<String>builder()
                .result("deleted").build();
    }


}
