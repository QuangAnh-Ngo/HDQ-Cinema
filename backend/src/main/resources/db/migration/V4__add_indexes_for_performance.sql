-- V4: Thêm index để tối ưu hiệu suất query

-- Index cho booking: tối ưu query xóa booking hết hạn (scheduler chạy mỗi 5 phút)
CREATE INDEX IF NOT EXISTS idx_booking_status_create_time
ON booking (booking_status, create_time);

-- Index cho booking: tối ưu query tìm booking theo member
CREATE INDEX IF NOT EXISTS idx_booking_member_id
ON booking (member_id);

-- Index cho show_time: tối ưu query lấy suất chiếu theo thời gian
CREATE INDEX IF NOT EXISTS idx_showtime_start_time
ON show_time (start_time);

-- Index cho show_time: tối ưu query lấy suất chiếu theo movie
CREATE INDEX IF NOT EXISTS idx_showtime_movie_id
ON show_time (movie_id);

-- Index cho show_time: tối ưu query lấy suất chiếu theo room
CREATE INDEX IF NOT EXISTS idx_showtime_room_id
ON show_time (room_id);

-- Composite index cho show_time: tối ưu query lấy suất chiếu trong khoảng thời gian
CREATE INDEX IF NOT EXISTS idx_showtime_start_time_room_movie
ON show_time (start_time, room_id, movie_id);

