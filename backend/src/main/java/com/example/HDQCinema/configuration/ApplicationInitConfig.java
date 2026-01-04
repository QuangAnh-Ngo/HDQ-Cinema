/*
package com.example.HDQCinema.configuration;

import com.example.HDQCinema.constant.PredefinedRole;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.enums.Position;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.EmployeeRepository;
import com.example.HDQCinema.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @Bean
    @Transactional
    ApplicationRunner applicationRunner(EmployeeAccountRepository employeeAccountRepository,
                                        RoleRepository roleRepository,
                                        EmployeeRepository employeeRepository) {
        return args -> {
            // Kiểm tra xem Admin đã tồn tại chưa
            if (employeeAccountRepository.findByUsername("admin").isEmpty()) {
                log.info("---- Khởi tạo tài khoản Admin mặc định ----");

                // 1. Tìm Role ADMIN (Role này ĐÃ ĐƯỢC TẠO bởi Flyway rồi)
                Role adminRole = roleRepository.findByName(PredefinedRole.ADMIN_ROLE)
                        .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Role ADMIN. Hãy kiểm tra lại Flyway script!"));

                // 2. Tạo Employee
                Employee employee = employeeRepository.findByEmail("admin@gmail.com")
                        .orElseGet(() -> employeeRepository.save(Employee.builder()
                                .firstName("Super")
                                .lastName("Admin")
                                .email("admin@gmail.com")
                                .position(Position.ADMIN)
                                .phone("0999999999")
                                .build()));

                // 3. Tạo Account và gán Role
                Set<Role> roles = new HashSet<>();
                roles.add(adminRole);

                EmployeeAccount adminAccount = EmployeeAccount.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin")) // Java làm tốt việc này hơn SQL
                        .email("admin@gmail.com")
                        .roles(roles)
                        .employee(employee)
                        .build();

                employeeAccountRepository.save(adminAccount);
                log.info("---- Đã tạo user: admin / pass: admin ----");
            }
        };
    }
}
*/
package com.example.HDQCinema.configuration;

import com.example.HDQCinema.constant.PredefinedRole;
import com.example.HDQCinema.entity.Employee;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.enums.Position;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.EmployeeRepository;
import com.example.HDQCinema.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.util.HashSet;
import java.util.Optional;


@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig{

    @NonFinal
    static String ADMIN_USER_NAME = "admin";

    @NonFinal
    static String ADMIN_PASSWORD = "admin";

    @NonFinal
    static String ADMIN_EMAIL = "admin@gmail.com";

    PasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driver-class-name",
            havingValue = "org.postgresql.Driver")
    ApplicationRunner applicationRunner(EmployeeAccountRepository employeeAccountRepository,
                                        RoleRepository roleRepository,
                                        EmployeeRepository employeeRepository) {
        return args -> {
            log.info("Đang tạo employee");
            Optional<Employee> existing = employeeRepository.findByEmail(ADMIN_EMAIL);
            Employee employee = existing.orElseGet(() -> {
                Employee e = Employee.builder()
                        .firstName("a")
                        .lastName("b")
                        .email(ADMIN_EMAIL)
                        .position(Position.ADMIN)
                        .phone("0")
                        .build();
                return employeeRepository.save(e);
            });

            log.info("Đang tạo employeeAccount");

            if (employeeAccountRepository.findByUsername(ADMIN_USER_NAME).isEmpty()) {

                roleRepository.findByName(PredefinedRole.MEMBER_ROLE).orElseGet(() ->
                        roleRepository.save(Role.builder()
                                .name(PredefinedRole.MEMBER_ROLE)
                                .description("Member role")
                                .build())
                );

                Role adminRole = roleRepository.findByName(PredefinedRole.ADMIN_ROLE).orElseGet(() ->
                        roleRepository.save(Role.builder()
                                .name(PredefinedRole.ADMIN_ROLE)
                                .description("Admin role")
                                .build())
                );

                var roles = new HashSet<Role>();
                roles.add(adminRole);

                EmployeeAccount employeeAccount = EmployeeAccount.builder()
                        .username(ADMIN_USER_NAME)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .email(ADMIN_EMAIL)
                        .roles(roles)
                        //.dayCreated(LocalDateTime.now())
                        .employee(employee)
                        .build();
                employeeAccountRepository.save(employeeAccount);
            }
        };
    }

}