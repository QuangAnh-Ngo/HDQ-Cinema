package com.example.HDQCinema.scheduler;

import com.example.HDQCinema.repository.BookingSeatRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TruncateBookingSeatScheduler {
    BookingSeatRepository bookingSeatRepository;

    @Scheduled(cron = "0 0 0 * * *") // chạy lúc 00:00 mỗi ngày(giây, phút, giờ, ngày trong tháng, tháng, ngày trong tuần)
    @Transactional
    public void truncate(){
        bookingSeatRepository.deleteAll();
    }
}
