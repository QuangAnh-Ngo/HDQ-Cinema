package com.example.HDQCinema.scheduler;

import com.example.HDQCinema.repository.BookingSeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CancelSeatHoldScheduler {
    BookingSeatRepository bookingSeatRepository;

    @Scheduled(fixedRate = 60 * 1000)
    @Transactional
    public void releaseExpiredHolds() {
        bookingSeatRepository.releaseHold(LocalDateTime.now());
    }
}
