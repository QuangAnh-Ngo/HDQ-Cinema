package com.example.HDQCinema.configuration;

import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.EmployeeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;


@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig{
    EmployeeAccountRepository  employeeAccountRepository;
    EmployeeRepository employeeRepository;
    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            String adminEmail = "admin@gmail.com";

            Optional<Employee> existing = employeeRepository.findByEmail(adminEmail);
            Employee employee = existing.orElseGet(() -> {
                Employee e = Employee.builder()
                        .firstName("a")
                        .lastName("b")
                        .email(adminEmail)
                        .position("It dev")
                        .phone("0")
                        .build();
                return employeeRepository.save(e);
            });

            if (employeeAccountRepository.findByUsername("admin").isEmpty()) {
                EmployeeAccount employeeAccount = EmployeeAccount.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .email(adminEmail)
                        .dayCreated(LocalDate.now())
                        .employee(employee)
                        .build();
                employeeAccountRepository.save(employeeAccount);
            }
        };
    }

}
