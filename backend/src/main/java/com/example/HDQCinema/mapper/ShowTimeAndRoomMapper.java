package com.example.HDQCinema.mapper;

import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import com.example.HDQCinema.dto.request.ShowTimeAndRoom;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ShowTimeAndRoomMapper {
    default ShowTimeAndRoom toShowTimeAndRoom(ShowTime showTime){
        if(showTime == null) return null;
        else {
            ShowTimeAndRoom showTimeAndRoom = ShowTimeAndRoom.builder()
                    .roomId(showTime.getRoom().getId())
                    .showTime(showTime.getStartTime())
                    .build();
            return showTimeAndRoom;
        }
    }
    List<ShowTimeAndRoom> toShowTimeAndRooms(List<ShowTime> showTimes);
}
