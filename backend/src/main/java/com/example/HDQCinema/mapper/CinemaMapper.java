package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.entity.Cinema;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RoomMapper.class})
public interface CinemaMapper {
    @Mapping(ignore = true, target = "rooms")
    Cinema toCinema(CinemaCreationRequest request);
    CinemaResponse toResponse(Cinema cinema);
    List<CinemaResponse> toResponses(List<Cinema> cinemas);
}
