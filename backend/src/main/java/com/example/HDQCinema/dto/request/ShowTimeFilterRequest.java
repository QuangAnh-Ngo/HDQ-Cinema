// backend/src/main/java/com/example/HDQCinema/dto/request/ShowTimeFilterRequest.java
package com.example.HDQCinema.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class ShowTimeFilterRequest {
    // Filter fields
    Long movieId;
    Long cinemaId;
    Long roomId;
    LocalDate dateFrom;
    LocalDate dateTo;
    String status; // upcoming, active, ended, all
    String search; // search by movie title, cinema name, room name
    
    // Pagination
    @Builder.Default
    int page = 0;
    
    @Builder.Default
    int size = 20;
    
    // Sorting
    @Builder.Default
    String sortBy = "startTime";
    
    @Builder.Default
    String sortDir = "desc";
}