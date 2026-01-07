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
    Long showtimeId;       // ID thực sự của bản ghi này
    Long movieId;          // ID của phim
    String movieTitle;     // Tên phim (tiện cho hiển thị)

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime startTime;  // Thời gian chiếu

    Long roomId;           // ID phòng chiếu
    String roomName;       // Tên phòng (tiện cho hiển thị)
    Long cinemaId;         // ID rạp
    String cinemaName;     // Tên rạp (tiện cho hiển thị)
}
