package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    Room toRoom(RoomRequest request);
//    @Mapping(ignore = true, target = "cinemaName")
    RoomResponse toResponse(Room room);
    List<RoomResponse> toResponses(List<Room> rooms);
}
