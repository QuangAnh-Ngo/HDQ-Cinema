package com.example.HDQCinema.configuration;

import com.example.HDQCinema.constant.PredefinedRole;
import com.example.HDQCinema.entity.Permission;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.repository.PermissionRepository;
import com.example.HDQCinema.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionSeeder implements ApplicationRunner {

    private final ApplicationContext applicationContext;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional // NEW: Quan trọng để update bảng phụ @ManyToMany
    public void run(ApplicationArguments args) {
        log.info("---- Bắt đầu Scan và khởi tạo Permission tự động ----");

        Set<String> foundPermissions = new HashSet<>();

        // 1. Scan code để tìm các permission
        String[] beanNames = applicationContext.getBeanNamesForAnnotation(RestController.class);
        for (String beanName : beanNames) {
            Object bean = applicationContext.getBean(beanName);
            Class<?> beanClass = bean.getClass(); // Lưu ý: Nếu dùng AOP proxy CGLIB có thể cần xử lý thêm

            for (Method method : beanClass.getMethods()) {
                if (method.isAnnotationPresent(PreAuthorize.class)) {
                    PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
                    String permissionName = extractPermissionName(preAuthorize.value());

                    // Loại bỏ logic hasRole, chỉ lấy hasAuthority nếu bạn muốn tách biệt
                    if (permissionName != null && !permissionName.isEmpty()) {
                        foundPermissions.add(permissionName);
                    }
                }
            }
        }

        // 2. Lưu Permission vào DB và gán cho ADMIN
        if (!foundPermissions.isEmpty()) {
            // Lấy Role ADMIN ra (đảm bảo ApplicationInitConfig chạy trước hoặc role đã tồn tại)
            Role adminRole = roleRepository.findByName(PredefinedRole.ADMIN_ROLE)
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name(PredefinedRole.ADMIN_ROLE)
                            .description("Admin role")
                            .build()));

            // Khởi tạo set nếu null (tránh NullPointerException)
            if (adminRole.getPermissions() == null) {
                adminRole.setPermissions(new HashSet<>());
            }

            for (String permName : foundPermissions) {
                // Tìm hoặc tạo mới Permission
                Permission permission = permissionRepository.findByName(permName)
                        .orElseGet(() -> {
                            Permission newPerm = Permission.builder()
                                    .name(permName)
                                    .description("Tự động tạo từ Code")
                                    .build();
                            return permissionRepository.save(newPerm);
                        });

                // --- QUAN TRỌNG: Gán permission vào Role ---
                // Chỉ add nếu chưa có để tránh duplicate trong Set (dù Set tự loại bỏ nhưng check cho an toàn logic)
                if (adminRole.getPermissions().stream().noneMatch(p -> p.getName().equals(permName))) {
                    adminRole.getPermissions().add(permission);
                    log.info("Đã gán quyền {} cho ADMIN", permName);
                }
            }

            // Lưu lại Role để cập nhật bảng trung gian (role_permissions)
            roleRepository.save(adminRole);
        }

        log.info("---- Hoàn tất khởi tạo và gán quyền ----");
    }

    private String extractPermissionName(String expression) {
        // Chỉ lấy hasAuthority, bỏ qua hasRole vì Role đã được định nghĩa riêng
        Pattern pattern = Pattern.compile("hasAuthority\\('([^']+)'\\)");
        Matcher matcher = pattern.matcher(expression);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }
}