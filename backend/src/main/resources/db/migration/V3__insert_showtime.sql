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


