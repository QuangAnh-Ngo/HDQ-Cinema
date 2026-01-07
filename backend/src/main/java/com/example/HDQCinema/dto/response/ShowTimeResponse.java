// backend/src/main/java/com/example/HDQCinema/dto/response/ShowTimeResponse.java
package com.example.HDQCinema.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShowTimeResponse {
    Long showtimeId;
    
    // Movie info
    Long movieId;
    String movieTitle;
    String moviePoster;
    Integer movieDuration;
    
    // Room info
    Long roomId;
    String roomName;
    
    // Cinema info
    Long cinemaId;
    String cinemaName;
    
    // Time info
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime startTime;
    
    String date;      // yyyy-MM-dd (for frontend grouping)
    String time;      // HH:mm (for display)
    
    // Status: upcoming, active, ended
    String status;
}