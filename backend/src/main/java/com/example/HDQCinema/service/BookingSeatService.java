package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.response.BookingSeatResponse;
import com.example.HDQCinema.entity.BookingSeat;
import com.example.HDQCinema.entity.Seat;
import com.example.HDQCinema.entity.ShowTime;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.repository.BookingSeatRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import com.example.HDQCinema.repository.TicketPriceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingSeatService {
    BookingSeatRepository bookingSeatRepository;
    TicketPriceRepository ticketPriceRepository;
    ShowTimeRepository showTimeRepository;

    public void create(ShowTime showTime){
        List<BookingSeat> bookingSeats = showTime.getRoom().getSeats().stream()
                .map(seat -> BookingSeat.builder()
                        .seat(seat)
                        .showTime(showTime)
                        .seatStatus(SeatStatus.AVAILABLE)
                        .price(getPrice(showTime,seat))
                        .build())
                .toList();
        bookingSeatRepository.saveAll(bookingSeats);
    }

    public double getPrice(ShowTime showTime, Seat seat){
        return ticketPriceRepository.toPrice(seat.getSeatType().toString(), showTime.getId());
    }

    public List<BookingSeatResponse> getAll(String showTimeId){
        ShowTime showTime = showTimeRepository.findById(showTimeId)
                .orElseThrow(()-> new RuntimeException("showtime doesn't exist"));
        List<BookingSeatResponse> bookingSeatResponses = showTime.getRoom().getSeats().stream()
                .map(seat -> BookingSeatResponse.builder()
                        .seat(""+ seat.getSeatRow()+seat.getSeatNumber())
                        .price(getPrice(showTime,seat))
                        .status(bookingSeatRepository.findStatusBySeatAndShowTime(seat, showTime).name())
                        .build())
                .sorted(
                        Comparator.comparing((BookingSeatResponse r) -> r.getSeat().substring(0, 1)) // theo hàng
                                .thenComparing(r -> Integer.parseInt(r.getSeat().substring(1)))    // theo số
                )                .toList();


        return  bookingSeatResponses;
    }
}
