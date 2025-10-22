package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.RoomForShowTimeResponse;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.dto.response.SeatPerShowTimeResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.RoomMapper;
import com.example.HDQCinema.repository.BookingDetailRepository;
import com.example.HDQCinema.repository.CinemaRepository;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    RoomMapper roomMapper;
    CinemaRepository cinemaRepository;
    ShowTimeRepository showTimeRepository;
    BookingDetailRepository bookingDetailRepository;

    public RoomResponse create(RoomRequest request){
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(()-> new RuntimeException("Cinema not found"));

        Room room = Room.builder()
                .roomName(request.getRoomName())
                .cinema(cinema)
                .build();

        room = roomRepository.save(room);

        RoomResponse response = roomMapper.toResponse(room);
        response.setCinemaName(cinema.getName());
        return response;
    }

    public RoomForShowTimeResponse get(String roomId, String showTimeId){
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_EXISTED));
        ShowTime showTime = showTimeRepository.findById(showTimeId).orElseThrow(() -> new AppException(ErrorCode.SHOWTIME_NOT_EXISTED));

        List<SeatPerShowTimeResponse> seats = new ArrayList<>();
        for(Seat seat : room.getSeats()){
            BookingDetail bookingDetail = bookingDetailRepository.findBySeatAndShowTime(seat, showTime);

            SeatPerShowTimeResponse response = SeatPerShowTimeResponse.builder()
                    .seatStatus(bookingDetail != null ? bookingDetail.getSeatStatus() : SeatStatus.AVAILABLE)
                    .seatId(seat.getId())
                    .seatName(""+seat.getSeatRow()+seat.getSeatNumber())
                    .seatType(seat.getSeatType())
                    .build();
            seats.add(response);
        }

        return RoomForShowTimeResponse.builder()
                .roomId(roomId)
                .showtimeId(showTimeId)
                .seats(seats)
                .roomName(room.getRoomName())
                .cinemaName(room.getCinema().getName())
                .build();

    }
}
