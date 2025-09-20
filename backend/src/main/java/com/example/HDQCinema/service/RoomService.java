package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.entity.Cinema;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.mapper.RoomMapper;
import com.example.HDQCinema.repository.CinemaRepository;
import com.example.HDQCinema.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    RoomMapper roomMapper;
    CinemaRepository cinemaRepository;

    public RoomResponse create(RoomRequest request){
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(()-> new RuntimeException("Cinema not found"));

        Room room = Room.builder()
                .roomName(request.getRoomName())
                .cinema(cinema)
                .build();

        room = roomRepository.save(room);

        return roomMapper.toResponse(room);
    }
}
