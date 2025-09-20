package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.entity.Room;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    Room toRoom(RoomRequest request);
    RoomResponse toResponse(Room room);
}
