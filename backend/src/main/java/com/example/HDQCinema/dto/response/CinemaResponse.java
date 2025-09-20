package com.example.HDQCinema.dto.response;

import com.example.HDQCinema.entity.Room;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CinemaResponse {
    String id;
    String name;
    String city;
    String district;
    String address;
    List<RoomResponse> rooms;
}
