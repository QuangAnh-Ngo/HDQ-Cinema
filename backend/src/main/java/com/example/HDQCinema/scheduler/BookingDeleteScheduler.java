package com.example.HDQCinema.scheduler;

import com.example.HDQCinema.enums.BookingStatus;
import com.example.HDQCinema.repository.BookingDetailRepository;
import com.example.HDQCinema.repository.BookingRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import com.example.HDQCinema.service.BookingService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingDeleteScheduler {

    BookingService bookingService;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    @Transactional
    public void autoDelete(){
//        String url = "http://localhost:8080/cinemas/showtimes";
//        restTemplate.delete(url, null,null);
//        log.info("{}", LocalDateTime.now());
        LocalDateTime limit = LocalDateTime.now().minusMinutes(15);
        bookingService.deleteExpiredBookings(limit);
    }
}
