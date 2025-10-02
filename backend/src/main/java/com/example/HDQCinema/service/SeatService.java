package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.SeatCreationRequest;
import com.example.HDQCinema.dto.response.SeatCreationResponse;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.Seat;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.enums.SeatType;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.SeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatService {
    SeatRepository seatRepository;
    RoomRepository roomRepository;

    public SeatCreationResponse create(SeatCreationRequest request){
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(()-> new RuntimeException("Room not exist"));

        for(Character character = request.getFirstSeatRow(); character <= request.getLastSeatRow(); character++){
            for(int column = request.getFirstColumnSeatNumber(); column<= request.getLastColumnSeatNumber(); column++){
                Seat seat = Seat.builder()
                        .seatRow(character)
                        .seatNumber(column)
                        .room(room)
                        .seatType(SeatType.valueOf(request.getType()))
                        .seatStatus(SeatStatus.AVAILABLE)
                        .build();
                seatRepository.save(seat);
            }
        }
        return SeatCreationResponse.builder()
                .seat("success")
                .build();
    }
}
