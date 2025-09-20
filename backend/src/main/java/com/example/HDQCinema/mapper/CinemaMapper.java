package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.entity.Cinema;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CinemaMapper {
    @Mapping(ignore = true, target = "rooms")
    Cinema toCinema(CinemaCreationRequest request);
    CinemaResponse toResponse(Cinema cinema);
}
