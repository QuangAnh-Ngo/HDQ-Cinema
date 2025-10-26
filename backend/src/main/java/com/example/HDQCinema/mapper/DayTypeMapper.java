package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.DayTypeRequest;
import com.example.HDQCinema.dto.response.DayTypeResponse;
import com.example.HDQCinema.entity.DayType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DayTypeMapper {
    DayType toDayType(DayTypeRequest request);
    DayTypeResponse toResponse(DayType dayType);
}
