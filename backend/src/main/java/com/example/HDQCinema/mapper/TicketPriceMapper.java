package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.TicketPriceRequest;
import com.example.HDQCinema.dto.response.TicketPriceResponse;
import com.example.HDQCinema.entity.TicketPrice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TicketPriceMapper {
    @Mapping(target = "dayType" , ignore = true)
    @Mapping(target = "cinema" , ignore = true)
    TicketPrice toTicketPrice(TicketPriceRequest request);
    @Mapping(target = "dayType" , ignore = true)
    TicketPriceResponse toResponse(TicketPrice ticketPrice);
}
