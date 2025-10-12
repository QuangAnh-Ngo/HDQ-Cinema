package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.mapper.ShowTimeMapper;
import com.example.HDQCinema.repository.BookingSeatRepository;
import com.example.HDQCinema.repository.MovieRepository;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ShowTimeService {
    ShowTimeRepository showTimeRepository;
    ShowTimeMapper showTimeMapper;
    RoomRepository roomRepository;
    MovieRepository movieRepository;
    BookingSeatRepository bookingSeatRepository;

    public ShowTimeResponse create(ShowTimeRequest request){
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(()-> new RuntimeException("movie not exist"));

        for(var showTimeRoom : request.getShowTimeRooms()){
            Room room = roomRepository.findById(showTimeRoom.getRoomId())
                    .orElseThrow(()-> new RuntimeException("room not exist"));
            ShowTime showTime = showTimeMapper.toShowTime(movie, room, showTimeRoom.getShowTime());

            List<BookingSeat> bookingSeats = new ArrayList<>();
            for(Seat seat:room.getSeats()){
                BookingSeat bookingSeat = BookingSeat.builder()
                        .seat(seat)
                        .showTime(showTime)
                        .seatStatus(SeatStatus.AVAILABLE)
                        .build();
                bookingSeats.add(bookingSeat);
            }
            showTime.setBookingSeats(new HashSet<>(bookingSeats));
            showTimeRepository.save(showTime);
        }

        return ShowTimeResponse.builder()
                .message("success")
                .build();
    }

}
