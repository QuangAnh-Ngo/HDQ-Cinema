package com.example.HDQCinema.scheduler;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ShowTimeDeleteScheduler {
    RestTemplate restTemplate;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void autoDelete(){
        String url = "http://localhost:8080/cinemas/showtimes";
        restTemplate.delete(url, null,null);
        log.info("{}", LocalDateTime.now());
    }
}
