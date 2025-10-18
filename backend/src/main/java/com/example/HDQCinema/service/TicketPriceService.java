package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.TicketPriceRequest;
import com.example.HDQCinema.dto.response.TicketPriceResponse;
import com.example.HDQCinema.entity.DayType;
import com.example.HDQCinema.mapper.TicketPriceMapper;
import com.example.HDQCinema.repository.CinemaRepository;
import com.example.HDQCinema.repository.DayTypeRepository;
import com.example.HDQCinema.repository.TicketPriceRepository;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketPriceService {
    TicketPriceRepository ticketPriceRepository;
    TicketPriceMapper ticketPriceMapper;
    DayTypeRepository dayTypeRepository;
    CinemaRepository cinemaRepository;

    public TicketPriceResponse create(TicketPriceRequest request){
        var ticket = ticketPriceMapper.toTicketPrice(request);

        var cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("cinema not exist"));

        var dayType = dayTypeRepository.findDayTypeByDayType(request.getDayType())
                .orElseThrow(() -> new RuntimeException("have to create day type first"));
        ticket.setDayType((DayType) dayType);
        ticket.setCinema(cinema);

        ticketPriceRepository.save(ticket);

        var response = ticketPriceMapper.toResponse(ticket);
        response.setCinemaId(request.getCinemaId());
        response.setDayType(request.getDayType());

        return response;
    }
}
