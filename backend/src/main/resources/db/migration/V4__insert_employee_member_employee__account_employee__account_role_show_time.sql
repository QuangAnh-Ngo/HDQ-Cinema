
INSERT INTO employee (first_name, last_name, email, phone, position)
SELECT
    gen.first_name,
    'Staff' AS last_name,
    gen.email,
    gen.phone,
    gen.position
FROM (
    VALUES
        (1, 20, 'MANAGER'),
        (21, 50, 'EMPLOYEE')
) AS roles(start_id, end_id, role_name)
CROSS JOIN LATERAL (
    SELECT
        roles.role_name || g.n AS first_name,
        LOWER(roles.role_name) || g.n || '@cinema.com' AS email,
        '0900' || LPAD(g.n::text, 6, '0') AS phone,
        roles.role_name AS position
    FROM generate_series(roles.start_id, roles.end_id) AS g(n)
) AS gen
ON CONFLICT (email) DO NOTHING;

INSERT INTO employee_account (employee_account_id, username, password, email, employee_id, day_created, status)
SELECT
    'emp_' || e.employee_id,
    LOWER(e.first_name) || e.employee_id,
    '$2a$10$SMf/TJ5/z/P.lYKIWt02QecWy5QP5fMj89fVleNm2uzM1ByTZjwnC', -- mật khẩu đơn giản cho tất cả
    e.email,
    e.employee_id,
    NOW() - (random() * 365 * '1 day'::interval),
    'ACTIVE'
FROM employee e
ON CONFLICT (employee_account_id) DO NOTHING;

INSERT INTO employee_account_roles (employee_account_employee_account_id, roles_role_id)
SELECT
    ea.employee_account_id,
    r.role_id
FROM employee_account ea
JOIN employee e ON ea.employee_id = e.employee_id
JOIN role r ON r.name = e.position  -- vì position = tên role: 'ADMIN', 'MANAGER', 'EMPLOYEE'
ON CONFLICT (employee_account_employee_account_id, roles_role_id) DO NOTHING;

INSERT INTO member (
    member_id, username, password, email, phone_number,
    first_name, last_name, dob, day_created, status
)
SELECT
    'mem_' || n,
    'user' || n,
    '$2a$10$SMf/TJ5/z/P.lYKIWt02QecWy5QP5fMj89fVleNm2uzM1ByTZjwnC',
    'user' || n || '@example.com',
    '0987' || LPAD((n % 10000000)::text, 7, '0'),  -- đảm bảo số điện thoại 10–11 chữ số
    'User',
    n::text,
    CURRENT_DATE - (random() * 21900)::int,        -- tuổi 0–60
    NOW() - (random() * 730 * '1 day'::interval),  -- tạo trong 2 năm gần đây
    'ACTIVE'
FROM generate_series(1, 500) AS n
ON CONFLICT (member_id) DO NOTHING;

INSERT INTO show_time (start_time, movie_id, room_id)
SELECT DISTINCT
    slot_time AS start_time,
    (
        SELECT m2.movie_id
        FROM movie m2
        WHERE m2.day_start <= slot_time::date
          AND slot_time::date <= m2.day_end
        ORDER BY RANDOM()
        LIMIT 1
    ) AS movie_id,
    r.room_id
FROM
    room r
    CROSS JOIN (
        -- Tạo khung giờ từ 08:00 đến 23:00, mỗi 90 phút (phù hợp phim ~2h + dọn dẹp)
        SELECT
            base_date + make_interval(hours => 8 + (interval_index * 90) / 60) AS slot_time
        FROM
            generate_series(0, 730) AS d  -- 731 ngày ≈ 2 năm
            CROSS JOIN generate_series(0, 9) AS interval_index  -- 10 suất/ngày (08:00 → 21:30)
            , LATERAL (SELECT '2025-12-20'::date + d * '1 day'::interval AS base_date) b
        WHERE
            -- Chỉ giữ ngày có ít nhất 1 phim đang chiếu
            EXISTS (
                SELECT 1 FROM movie m
                WHERE m.day_start <= b.base_date AND b.base_date <= m.day_end
            )
    ) AS time_slots
LIMIT 300000
ON CONFLICT (start_time, room_id) DO NOTHING; --đc 82k showtime


-- Chèn ~500 suất chiếu hợp lệ
-- INSERT INTO show_time (start_time, movie_id, room_id)
-- SELECT DISTINCT
--     slot_time AS start_time,
--     (
--         SELECT m2.movie_id
--         FROM movie m2
--         WHERE m2.day_start <= slot_time::date
--           AND slot_time::date <= m2.day_end
--         ORDER BY RANDOM()
--         LIMIT 1
--     ) AS movie_id,
--     r.room_id
-- FROM
--     room r
--     CROSS JOIN (
--         -- Chỉ lấy 30 ngày gần nhất (đủ phim chiếu)
--         SELECT
--             ('2025-12-20'::date + d * '1 day'::interval) 
--             + (8 + s * 1.5) * '1 hour'::interval AS slot_time
--         FROM generate_series(0, 29) AS d       -- 30 ngày
--         CROSS JOIN generate_series(0, 3) AS s  -- 4 suất/ngày: 08:00, 09:30, 11:00, 12:30
--     ) AS time_slots
-- WHERE
--     -- Đảm bảo slot_time::date CÓ phim đang chiếu
--     EXISTS (
--         SELECT 1
--         FROM movie m
--         WHERE m.day_start <= time_slots.slot_time::date
--           AND time_slots.slot_time::date <= m.day_end
--     )
-- -- Giới hạn ~500 bản ghi (giả sử ~20 phòng → 30*4*20 = 2400 → lấy 500)
-- LIMIT 500
-- ON CONFLICT (start_time, room_id) DO NOTHING;

INSERT INTO member_roles (member_member_id, roles_role_id)
SELECT
    m.member_id,
    r.role_id
FROM member m
CROSS JOIN role r
WHERE r.name = 'MEMBER'
ON CONFLICT (member_member_id, roles_role_id) DO NOTHING; --tca member deu co role la MEMBER




-- INSERT BẢNG booking và booking_detail
-- 🔸 BƯỚC 1: Lấy danh sách (seat, showtime) cho suất chiếu đã kết thúc
CREATE TEMP TABLE past_slots AS
SELECT 
    s.seat_id,
    s.seat_type,
    st.showtime_id,
    st.start_time
FROM show_time st
JOIN seat s ON s.room_id = st.room_id
WHERE st.start_time < NOW() - INTERVAL '1 day'  -- chỉ lấy suất đã chiếu xong
  AND st.movie_id IS NOT NULL
ORDER BY RANDOM()
LIMIT 3000;  -- đủ cho 1000 booking × 3 ghế

-- 🔸 BƯỚC 2: Thêm số thứ tự
ALTER TABLE past_slots ADD COLUMN rn SERIAL;

-- 🔸 BƯỚC 3: Lấy 1000 member NGẪU NHIÊN (đảm bảo không trùng lặp trong 1 lần tạo)
CREATE TEMP TABLE random_members AS
SELECT member_id, ROW_NUMBER() OVER (ORDER BY RANDOM()) AS rn
FROM member
LIMIT 1000;

-- 🔸 BƯỚC 4: Tạo 1000 booking — mỗi booking 1 member KHÁC NHAU
INSERT INTO booking (total_price, create_time, booking_status, member_id)
SELECT
    0.0,
    ps.start_time - (INTERVAL '2 hours' + (RANDOM() * INTERVAL '14 days')), -- đặt trước 2h–14 ngày
    'CONFIRM',
    rm.member_id
FROM (
    SELECT 
        MIN(start_time) AS start_time,
        CEIL(rn / 3.0)::INT AS booking_rn
    FROM past_slots
    GROUP BY CEIL(rn / 3.0)
    ORDER BY booking_rn
    LIMIT 1000
) ps
JOIN random_members rm ON rm.rn = ps.booking_rn;

-- 🔸 BƯỚC 5: Tạo booking_detail — 3 ghế mỗi booking
INSERT INTO booking_detail (price, seat_status, booking_id, seat_id, showtime_id)
SELECT
    CASE WHEN s.seat_type = 'VIP' THEN 120000.0 ELSE 80000.0 END,
    'BOOKED',
    b.booking_id,
    ps.seat_id,
    ps.showtime_id
FROM booking b
JOIN past_slots ps 
    ON ps.rn BETWEEN (b.booking_id - (SELECT MIN(booking_id) FROM booking)) * 3 + 1 
                 AND (b.booking_id - (SELECT MIN(booking_id) FROM booking) + 1) * 3
JOIN seat s ON s.seat_id = ps.seat_id;

-- 🔸 BƯỚC 6: Cập nhật total_price
UPDATE booking b
SET total_price = (SELECT COALESCE(SUM(price), 0) FROM booking_detail bd WHERE bd.booking_id = b.booking_id);