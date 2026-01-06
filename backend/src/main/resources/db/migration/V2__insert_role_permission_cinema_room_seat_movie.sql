-- 1. Insert Permissions (Dựa trên PredefinedPermission.java)
INSERT INTO permission (name, description) VALUES
                                               ('MANAGE_MOVIES', 'Quản lý phim'),
                                               ('MANAGE_SHOWTIMES', 'Quản lý lịch chiếu'),
                                               ('MANAGE_BOOKINGS', 'Quản lý đặt vé (Admin/Staff)'),
                                               ('MANAGE_CINEMAS', 'Quản lý rạp'),
                                               ('MANAGE_ROOMS', 'Quản lý phòng chiếu'),
                                               ('MANAGE_EMPLOYEES', 'Quản lý nhân viên'),
                                               ('VIEW_REPORTS', 'Xem báo cáo thống kê'),
                                               ('MANAGE_SEATS', 'Quản lý ghế và sơ đồ'),
                                               ('PROCESS_REFUNDS', 'Xử lý hoàn tiền'),
                                               ('BOOKING', 'Quyền đặt vé'),
                                               ('MANAGE_PRICE', 'Quản lý bảng giá vé'),
                                               ('PAYMENT', 'Quyền thanh toán')
    ON CONFLICT (name) DO NOTHING;

-- 2. Insert Roles (Thêm MANAGER như yêu cầu)
INSERT INTO role (name, description) VALUES
                                         ('ADMIN', 'Quản trị viên hệ thống - Full quyền'),
                                         ('MANAGER', 'Quản lý rạp - Quản lý vận hành'),
                                         ('EMPLOYEE', 'Nhân viên - Bán vé và hỗ trợ'),
                                         ('MEMBER', 'Khách hàng thành viên')
    ON CONFLICT (name) DO NOTHING;

-- 3. Phân quyền (Mapping Role -> Permission)
-- 3.1. ADMIN: Có TẤT CẢ quyền
INSERT INTO role_permissions (role_role_id, permissions_permission_id)
SELECT r.role_id, p.permission_id
FROM role r
         CROSS JOIN permission p
WHERE r.name = 'ADMIN'
    ON CONFLICT DO NOTHING;

-- 3.2. MANAGER: Có hầu hết quyền vận hành (Trừ các quyền hệ thống nếu có sau này)
INSERT INTO role_permissions (role_role_id, permissions_permission_id)
SELECT r.role_id, p.permission_id
FROM role r, permission p
WHERE r.name = 'MANAGER'
  AND p.name IN (
                 'MANAGE_MOVIES', 'MANAGE_SHOWTIMES', 'MANAGE_BOOKINGS',
                 'MANAGE_CINEMAS', 'MANAGE_ROOMS', 'MANAGE_EMPLOYEES',
                 'VIEW_REPORTS', 'MANAGE_SEATS', 'PROCESS_REFUNDS', 'MANAGE_PRICE'
    )
    ON CONFLICT DO NOTHING;

-- 3.3. EMPLOYEE: Quyền bán vé, xem lịch chiếu
INSERT INTO role_permissions (role_role_id, permissions_permission_id)
SELECT r.role_id, p.permission_id
FROM role r, permission p
WHERE r.name = 'EMPLOYEE'
  AND p.name IN ('BOOKING', 'PAYMENT', 'MANAGE_BOOKINGS', 'MANAGE_SHOWTIMES')
    ON CONFLICT DO NOTHING;

-- 3.4. MEMBER: Quyền đặt vé và thanh toán
INSERT INTO role_permissions (role_role_id, permissions_permission_id)
SELECT r.role_id, p.permission_id
FROM role r, permission p
WHERE r.name = 'MEMBER'
  AND p.name IN ('BOOKING', 'PAYMENT')
    ON CONFLICT DO NOTHING;

-- ========================================================
-- PHẦN DỮ LIỆU RẠP VÀ PHIM
-- ========================================================

-- 4. Bảng cinema (Đã đổi tên sang HDQ Cinema)
-- Lưu ý: Vì ID là Identity (bigint), ta insert cứng ID để đảm bảo map đúng với code nếu có hardcode
INSERT INTO cinema (cinema_id, name, address, city, district) VALUES
                                                                  (1, 'HDQ Cinema Central Park', '208 Nguyễn Hữu Cảnh, Q. Bình Thạnh', 'TP.HCM', 'Bình Thạnh'),
                                                                  (2, 'HDQ Cinema Phú Thọ', '383 Nguyễn Trãi, Q.11', 'TP.HCM', 'Quận 11'),
                                                                  (3, 'HDQ Cinema Đồng Khởi', '72 Lê Thánh Tôn, Q.1', 'TP.HCM', 'Quận 1'),
                                                                  (4, 'HDQ Cinema Đà Nẵng', 'Tầng 5, Vincom Plaza Đà Nẵng', 'Đà Nẵng', 'Hải Châu'),
                                                                  (5, 'HDQ Cinema Cẩm Lệ', 'Tầng 3, Lotte Mart Đà Nẵng', 'Đà Nẵng', 'Cẩm Lệ')
    ON CONFLICT (cinema_id) DO NOTHING;

-- Reset sequence để tránh lỗi duplicate key nếu insert thêm sau này
SELECT setval(pg_get_serial_sequence('cinema', 'cinema_id'), (SELECT MAX(cinema_id) FROM cinema));

-- 5. Cập nhật bảng movie (Thêm cột name)
ALTER TABLE movie ADD COLUMN IF NOT EXISTS name varchar(255);

-- 6. Insert dữ liệu phim
INSERT INTO movie (movie_id, title, name, genre, director, description, poster, trailer_url, duration, limit_age, day_start, day_end) VALUES
                                                                                                                                          (1, 'Avengers: Endgame', 'Avengers: Cuộc chiến vĩ đại', 'Hành động, Viễn tưởng', 'Anthony Russo, Joe Russo', 'Phần kết vĩ đại của loạt Avengers.', 'https://upload.wikimedia.org/wikipedia/vi/2/2d/Avengers_Endgame_bia_teaser.jpg', 'https://youtu.be/TcMBFSGVi1c', 181, 13, '2025-12-20', '2026-03-20'),
                                                                                                                                          (2, 'Parasite', 'Ký sinh trùng', 'Hài, Kịch tính', 'Bong Joon-ho', 'Gia đình nghèo sống sót bằng cách xâm nhập vào nhà giàu.', 'https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://youtu.be/5xH0HfJHsaY', 132, 16, '2025-12-22', '2026-02-28'),
                                                                                                                                          (3, 'Soul', 'Tâm hồn thuần khiết', 'Hoạt hình, Gia đình', 'Pete Docter', 'Giáo viên nhạc jazz tìm lại ý nghĩa cuộc sống.', 'https://upload.wikimedia.org/wikipedia/vi/3/3d/Soul_VN_poster.jpg', 'https://youtu.be/xOsLIiBStEs', 100, 0, '2025-12-24', '2026-04-10'),
                                                                                                                                          (4, 'Dune', 'Dune: Sa mạc huyền bí', 'Viễn tưởng, Phiêu lưu', 'Denis Villeneuve', 'Cuộc chiến tranh giành hành tinh sa mạc Arrakis.', 'https://m.media-amazon.com/images/M/MV5BNWIyNmU5MGYtZDZmNi00ZjAwLWJlYjgtZTc0ZGIxMDE4ZGYwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://youtu.be/8g18jFHCLXk', 155, 13, '2025-12-25', '2026-03-15'),
                                                                                                                                          (5, 'The Batman', 'Người dơi', 'Hành động, Tội phạm', 'Matt Reeves', 'Batman điều tra chuỗi án mạng liên quan đến giới tinh hoa Gotham.', 'https://www.limitedruns.com/media/cache/e3/b8/e3b8960f3a58538989b2a23caae08783.jpg', 'https://youtu.be/mqqft2x_Aa4', 176, 13, '2025-12-26', '2026-04-05'),
                                                                                                                                          (6, 'Everything Everywhere All At Once', 'Tất cả mọi thứ khắp mọi nơi cùng lúc', 'Hành động, Hài, Viễn tưởng', 'Daniels', 'Bà chủ tiệm giặt ủi khám phá đa vũ trụ.', 'https://resizing.flixster.com/mx-agGjjsUK1QMyuv3AJhHI3hgo=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzA3ZjU2MGU1LWMxODItNDlkMC1hYzJhLTY2YzMwOGZkMDhiZi5qcGc=', 'https://youtu.be/wxN1T1uxQ2g', 139, 13, '2025-12-27', '2026-03-30'),
                                                                                                                                          (7, 'Top Gun: Maverick', 'Top Gun: Phi công siêu đẳng', 'Hành động, Chính kịch', 'Joseph Kosinski', 'Maverick huấn luyện phi công trẻ cho nhiệm vụ nguy hiểm.', 'https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg', 'https://youtu.be/giXco2jaZ_4', 131, 13, '2025-12-28', '2026-04-01'),
                                                                                                                                          (8, 'Spider-Man: No Way Home', 'Người Nhện: Vũ trụ mới', 'Hành động, Viễn tưởng', 'Jon Watts', 'Peter Parker mở đa vũ trụ, gọi về những Người Nhện cũ.', 'https://resizing.flixster.com/8PNiwC2bpe9OecfYZSOVkvYC5vk=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzL2U5NGM0Y2Q1LTAyYTItNGFjNC1hNWZhLWMzYjJjOTdjMTFhOS5qcGc=', 'https://youtu.be/tLYaV7T1Qs0', 148, 13, '2025-12-29', '2026-03-25'),
                                                                                                                                          (9, 'Oppenheimer', 'Oppenheimer', 'Tiểu sử, Chính kịch', 'Christopher Nolan', 'Câu chuyện về cha đẻ bom nguyên tử.', 'https://baodongnai.com.vn/file/e7837c02876411cd0187645a2551379f/082023/18_1_20230818225948.jpg', 'https://youtu.be/uYPbbksJxIg', 180, 16, '2025-12-30', '2026-05-01'),
                                                                                                                                          (10, 'Barbie', 'Barbie', 'Hài, Phiêu lưu', 'Greta Gerwig', 'Barbie rời thế giới hoàn hảo để khám phá thế giới thật.', 'https://image.tmdb.org/t/p/original/dekMkQf0kqAmztUca9lX5e5Pjbp.jpg', 'https://youtu.be/pBk4NYhWNMM', 114, 13, '2025-12-31', '2026-04-10'),
                                                                                                                                          (11, 'Inception', 'Kỵ sĩ mơ', 'Viễn tưởng, Hành động', 'Christopher Nolan', 'Xâm nhập vào giấc mơ của con người.', 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/i/n/inception.jpg', 'https://youtu.be/YoHD9XEInc0', 148, 13, '2025-12-20', '2026-03-10'),
                                                                                                                                          (12, 'Interstellar', 'Hố đen tử thần', 'Viễn tưởng, Phiêu lưu', 'Christopher Nolan', 'Hành trình vượt không-thời gian tìm nơi ở mới.', 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg', 'https://youtu.be/zSWdZVtXT7E', 169, 13, '2025-12-21', '2026-03-12'),
                                                                                                                                          (13, 'The Godfather', 'Bố già', 'Tội phạm, Chính kịch', 'Francis Ford Coppola', 'Gia đình mafia quyền lực nhất nước Mỹ.', 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg', 'https://youtu.be/sY1S34973zA', 175, 18, '2025-12-22', '2026-02-20'),
                                                                                                                                          (14, 'Pulp Fiction', 'Chuyện kể kinh dị', 'Tội phạm, Hài đen', 'Quentin Tarantino', 'Những câu chuyện đan xen của giới giang hồ.', 'https://image.tmdb.org/t/p/original/gSnbhR0vftfJ2U6KpGmR7WzZlVo.jpg', 'https://youtu.be/s7EdQ4FqbhY', 154, 18, '2025-12-23', '2026-02-22'),
                                                                                                                                          (15, 'La La Land', 'Những kẻ mộng mơ', 'Âm nhạc, Lãng mạn', 'Damien Chazelle', 'Tình yêu giữa nhạc công và diễn viên múa.', 'https://m.media-amazon.com/images/M/MV5BM2JlYjE4YWYtMTA3MC00YTAwLTg3OGMtZjQxMjQzMGM3M2U0XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://youtu.be/0pdqf4P9MB8', 128, 13, '2025-12-24', '2026-03-05'),
                                                                                                                                          (16, 'The Shawshank Redemption', 'Cửa sổ sổ chuộc tội', 'Chính kịch', 'Frank Darabont', 'Hy vọng và tình bạn trong nhà tù.', 'https://vcdn1-giaitri.vnecdn.net/2022/03/31/shawshank-redemption-137394414-7901-5918-1648713782.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=-66ReGIzmqsqLLHhizjURw', 'https://youtu.be/6hB3S9bIaco', 142, 16, '2025-12-25', '2026-03-15'),
                                                                                                                                          (17, 'Forrest Gump', 'Forrest Gump', 'Chính kịch, Lãng mạn', 'Robert Zemeckis', 'Cuộc đời kỳ diệu của người đàn ông ngây thơ.', 'https://upload.wikimedia.org/wikipedia/vi/1/1d/Forrest_gump.jpg', 'https://youtu.be/bLvqoHBptjg', 142, 13, '2025-12-26', '2026-03-20'),
                                                                                                                                          (18, 'The Dark Knight', 'Kỵ sĩ bóng đêm', 'Hành động, Tội phạm', 'Christopher Nolan', 'Batman đối đầu Joker điên loạn.', 'https://upload.wikimedia.org/wikipedia/vi/2/2d/Poster_phim_K%E1%BB%B7_s%C4%A9_b%C3%B3ng_%C4%91%C3%AAm_2008.jpg', 'https://youtu.be/EXeTwQWrcwY', 152, 13, '2025-12-27', '2026-03-25'),
                                                                                                                                          (19, 'Joker', 'Kẻ hề ma quái', 'Tội phạm, Chính kịch', 'Todd Phillips', 'Nguồn gốc của kẻ phản diện vĩ đại.', 'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/r/s/rsz_poster_payoff_joker_folie_a_deux_5_1_.jpg', 'https://youtu.be/zAGVQLHvwOY', 122, 18, '2025-12-28', '2026-04-01'),
                                                                                                                                          (20, 'Mad Max: Fury Road', 'Con đường cuồng nộ', 'Hành động, Phiêu lưu', 'George Miller', 'Cuộc trốn chạy qua sa mạc chết chóc.', 'https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://youtu.be/hEJnMQG9ev8', 120, 16, '2025-12-29', '2026-04-05'),
                                                                                                                                          (21, 'Get Out', 'Trốn thoát', 'Kinh dị, Giật gân', 'Jordan Peele', 'Chàng trai da màu phát hiện bí mật kinh hoàng.', 'https://upload.wikimedia.org/wikipedia/vi/6/66/Tr%E1%BB%91n_tho%C3%A1t_poster.jpg', 'https://youtu.be/Ddc36Usx78Y', 104, 16, '2025-12-30', '2026-03-30'),
                                                                                                                                          (22, 'Moonlight', 'Ánh trăng mờ', 'Chính kịch', 'Barry Jenkins', 'Hành trình trưởng thành của cậu bé da màu đồng tính.', 'https://upload.wikimedia.org/wikipedia/vi/8/84/Moonlight_%282016_film%29.png', 'https://youtu.be/9NJj12tJzqQ', 111, 16, '2025-12-31', '2026-03-10'),
                                                                                                                                          (23, 'Whiplash', 'Cú sốc', 'Chính kịch, Âm nhạc', 'Damien Chazelle', 'Giấc mơ thành ngôi sao trống jazz.', 'https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p10488558_p_v12_ai.jpg', 'https://youtu.be/7d_jQycdQGo', 106, 16, '2025-12-20', '2026-02-28'),
                                                                                                                                          (24, 'The Revenant', 'Người trở về', 'Hành động, Phiêu lưu', 'Alejandro G. Iñárritu', 'Cuộc sống sót thần kỳ giữa thiên nhiên hoang dã.', 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b6/The_Revenant_2015_film_poster.jpg/250px-The_Revenant_2015_film_poster.jpg', 'https://youtu.be/LoebZZ8K5N0', 156, 16, '2025-12-21', '2026-03-05'),
                                                                                                                                          (25, 'Black Panther', 'Chiến binh báo đen', 'Hành động, Viễn tưởng', 'Ryan Coogler', 'Vua trẻ Wakanda bảo vệ vương quốc.', 'https://lumiere-a.akamaihd.net/v1/images/p_blackpanther_19754_4ac13f07.jpeg?region=0,0,540,810', 'https://youtu.be/xjDjIWPwcPU', 134, 13, '2025-12-22', '2026-03-15'),
                                                                                                                                          (26, 'Coco', 'Câu chuyện âm nhạc', 'Hoạt hình, Gia đình', 'Lee Unkrich', 'Cậu bé vượt qua thế giới người chết để theo đuổi đam mê.', 'https://m.media-amazon.com/images/M/MV5BMDIyM2E2NTAtMzlhNy00ZGUxLWI1NjgtZDY5MzhiMDc5NGU3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://youtu.be/xlnPHQ3TLX8', 105, 0, '2025-12-23', '2026-04-01'),
                                                                                                                                          (27, 'Shang-Chi', 'Thượng Khí', 'Hành động, Viễn tưởng', 'Destin Daniel Cretton', 'Chiến binh võ thuật đối đầu quá khứ.', 'https://m.media-amazon.com/images/M/MV5BZmY5MDcyNzAtYzg3MC00MGNlLTg3OGItNmRjYThkZGVlNzAyXkEyXkFqcGc@._V1_.jpg', 'https://youtu.be/8YjFbMbfXaQ', 132, 13, '2025-12-24', '2026-04-05'),
                                                                                                                                          (28, 'Encanto', 'Phép màu Colombia', 'Hoạt hình, Gia đình', 'Jared Bush', 'Cô bé không có phép nhưng cứu cả gia đình.', 'https://m.media-amazon.com/images/M/MV5BNGEyNzk2M2MtNjBhZS00MzYwLWI0Y2YtYjc5ZWE2MjM0YWE5XkEyXkFqcGc@._V1_.jpg', 'https://youtu.be/CaimKeDcudo', 102, 0, '2025-12-25', '2026-04-10'),
                                                                                                                                          (29, 'Poor Things', 'Chúa tể của những điều khốn khổ', 'Hài đen, Viễn tưởng', 'Yorgos Lanthimos', 'Người phụ nữ tái sinh với tâm trí trẻ thơ.', 'https://m.media-amazon.com/images/M/MV5BYWU2MjRjZTYtMjVkMS00MTBjLWFiMTAtYmZlYTk1YjkyMWFkXkEyXkFqcGc@._V1_.jpg', 'https://youtu.be/RlbR5N6veqw', 141, 18, '2025-12-26', '2026-05-01'),
                                                                                                                                          (30, 'Dune: Part Two', 'Dune: Phần Hai', 'Viễn tưởng, Phiêu lưu', 'Denis Villeneuve', 'Paul Atreides dẫn dắt cuộc nổi dậy.', 'https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', 'https://youtu.be/way9Dexny3w', 166, 13, '2026-01-10', '2026-06-01')
    ON CONFLICT (movie_id) DO NOTHING;

-- Reset sequence cho movie (Nếu dùng Identity)
SELECT setval(pg_get_serial_sequence('movie', 'movie_id'), (SELECT MAX(movie_id) FROM movie));

-- ========================================================
-- 1. TẠO DATA CHO BẢNG ROOM (PHÒNG CHIẾU)
-- Logic: Mỗi rạp có ngẫu nhiên từ 6 đến 10 phòng
-- ========================================================
INSERT INTO room (room_name, cinema_id)
SELECT
    'Phòng ' || r.n AS room_name,
    c.cinema_id
FROM cinema c
         CROSS JOIN LATERAL generate_series(1, floor(random() * (10 - 6 + 1) + 6)::int) AS r(n);

-- Reset sequence cho room để tránh lỗi ID về sau
SELECT setval(pg_get_serial_sequence('room', 'room_id'), (SELECT MAX(room_id) FROM room));


-- ========================================================
-- 2. TẠO DATA CHO BẢNG SEAT (GHẾ NGỒI)
-- Logic:
-- Mỗi phòng có 3 hàng (A, B, C) x 9 ghế (1-9) = 27 ghế (Thỏa mãn 20-30 ghế)
-- Hàng A (row_num = 1) là VIP, còn lại là CLASSIC
-- ========================================================
INSERT INTO seat (seat_number, seat_row, seat_type, room_id)
SELECT
    s_num.n AS seat_number,
    chr(64 + s_row.n) AS seat_row, -- Chuyển số 1->A, 2->B, 3->C
    CASE
        WHEN s_row.n = 1 THEN 'VIP'
        ELSE 'CLASSIC'
        END AS seat_type,
    rm.room_id
FROM room rm
         CROSS JOIN generate_series(1, 5) AS s_row(n) -- 5 Hàng: A, B, C
         CROSS JOIN generate_series(1, 9) AS s_num(n); -- 9 Ghế mỗi hàng: 1 -> 9

-- Reset sequence cho seat
SELECT setval(pg_get_serial_sequence('seat', 'seat_id'), (SELECT MAX(seat_id) FROM seat));


-- ========================================================
-- 3. TẠO DATA CHO BẢNG DAY_TYPE (LOẠI NGÀY)
-- Lưu ý: ID là bigint tự tăng, nhưng ta insert cứng ID 1, 2 để dễ quản lý
-- ========================================================
INSERT INTO day_type (id, day_type, day_start, day_end) VALUES
                                                            (1, 'WEEKDAY', '2025-01-01', '2026-12-31'), -- Ngày thường
                                                            (2, 'WEEKEND', '2025-01-01', '2026-12-31')  -- Cuối tuần
    ON CONFLICT (id) DO NOTHING;

-- Reset sequence cho day_type
SELECT setval(pg_get_serial_sequence('day_type', 'id'), (SELECT MAX(id) FROM day_type));


-- ========================================================
-- 4. (TÙY CHỌN) TẠO GIÁ VÉ MẪU (TICKET_PRICE)
-- Để hệ thống tính tiền được, cần có bảng giá cơ bản
-- ========================================================
INSERT INTO ticket_price (price, seat_type, cinema_id, day_type)
SELECT
    CASE
        WHEN d.day_type = 'WEEKEND' AND seat_type = 'VIP' THEN 120000
        WHEN d.day_type = 'WEEKEND' AND seat_type = 'CLASSIC' THEN 100000
        WHEN d.day_type = 'WEEKDAY' AND seat_type = 'VIP' THEN 90000
        ELSE 70000 -- WEEKDAY CLASSIC
        END as price,
    seat_type,
    c.cinema_id,
    d.day_type
FROM cinema c
         CROSS JOIN (SELECT DISTINCT seat_type FROM seat) s_type
         CROSS JOIN day_type d
    ON CONFLICT DO NOTHING;

