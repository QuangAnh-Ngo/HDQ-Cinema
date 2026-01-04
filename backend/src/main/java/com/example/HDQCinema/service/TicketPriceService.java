package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.TicketPriceRequest;
import com.example.HDQCinema.dto.request.TicketPriceUpdateRequest;
import com.example.HDQCinema.dto.response.TicketPriceResponse;
import com.example.HDQCinema.entity.DayType;
import com.example.HDQCinema.entity.TicketPrice;
import com.example.HDQCinema.enums.SeatType;
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

    public TicketPriceResponse update(String ticketPriceId,TicketPriceUpdateRequest request){
        TicketPrice ticket = ticketPriceRepository.findTicketPriceById(ticketPriceId);

        if(!request.getCinemaId().isEmpty()) {
            var cinema = cinemaRepository.findById(request.getCinemaId())
                    .orElseThrow(() -> new RuntimeException("cinema not exist"));
            ticket.setCinema(cinema);
        }

        if(!request.getDayType().isEmpty()) {
            var dayType = dayTypeRepository.findDayTypeByDayType(request.getDayType())
                    .orElseThrow(() -> new RuntimeException("day not exist"));
            ticket.setDayType((DayType) dayType);
        }

        if(!String.valueOf(request.getPrice()).isEmpty()) ticket.setPrice(request.getPrice());
        if(!String.valueOf(request.getSeatType()).isEmpty()) ticket.setSeatType(SeatType.valueOf(request.getSeatType()));

        ticketPriceRepository.save(ticket);

        var response = ticketPriceMapper.toResponse(ticket);
        response.setCinemaId(request.getCinemaId());
        response.setDayType(request.getDayType());

        return response;
    }

    public void delete(String ticketPriceId){
        ticketPriceRepository.deleteTicketPriceById(ticketPriceId);
    }
}
