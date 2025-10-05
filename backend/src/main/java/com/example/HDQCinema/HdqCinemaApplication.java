package com.example.HDQCinema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HdqCinemaApplication {

	public static void main(String[] args) {
		SpringApplication.run(HdqCinemaApplication.class, args);
	}

}
