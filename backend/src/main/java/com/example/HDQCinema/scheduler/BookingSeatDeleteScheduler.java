package com.example.HDQCinema.scheduler;

import com.example.HDQCinema.repository.BookingDetailRepository;
import com.example.HDQCinema.repository.BookingRepository;
import com.example.HDQCinema.repository.BookingSeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingSeatDeleteScheduler {

    BookingSeatRepository bookingSeatRepository;

    @Scheduled(fixedRate = 5 * 60 * 1000)
    @Transactional
    public void autoDelete(){
        bookingSeatRepository.deleteExpiredTimeBookingSeat();
    }
}
