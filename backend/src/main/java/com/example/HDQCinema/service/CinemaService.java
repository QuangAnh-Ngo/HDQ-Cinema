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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CinemaService {
    CinemaRepository cinemaRepository;
    CinemaMapper cinemaMapper;
    RoomRepository roomRepository;

    public CinemaResponse create(CinemaCreationRequest request){
        log.info("{}", request.getName());

        Cinema cinema = cinemaMapper.toCinema(request);

        cinema= cinemaRepository.save(cinema);

        return cinemaMapper.toResponse(cinema);
    }

    public CinemaResponse get(String id){
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("cinema not exist"));

        var response = cinemaMapper.toResponse(cinema);
        response.getRooms().forEach(roomResponse -> roomResponse.setCinemaName(cinema.getName()));

        return response;
    }
}
