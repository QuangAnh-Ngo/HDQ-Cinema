package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    @Mapping(target = "seats", ignore = true)
    @Mapping(target = "showTime", ignore = true)
    BookingResponse toResponse(Booking booking);
}
