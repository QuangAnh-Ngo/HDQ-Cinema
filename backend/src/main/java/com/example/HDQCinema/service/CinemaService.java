package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.entity.Cinema;
import com.example.HDQCinema.mapper.CinemaMapper;
import com.example.HDQCinema.repository.CinemaRepository;
import com.example.HDQCinema.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaService {
    CinemaRepository cinemaRepository;
    CinemaMapper cinemaMapper;
    RoomRepository roomRepository;

    public CinemaResponse create(CinemaCreationRequest request){
        Cinema cinema = cinemaMapper.toCinema(request);

        var rooms = roomRepository.findByRoomNameIn(request.getRooms());
        cinema.setRooms(new HashSet<>(rooms));

        cinemaRepository.save(cinema);

        return cinemaMapper.toResponse(cinema);
    }
}
