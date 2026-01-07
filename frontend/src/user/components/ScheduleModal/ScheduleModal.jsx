// frontend/src/user/components/ScheduleModal/ScheduleModal.jsx
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Modal, Spin, message, Empty } from "antd";
import {
  movieService,
  cinemaService,
  showtimeService,
} from "../../../services";
import "./ScheduleModal.scss";

const ScheduleModal = ({
  visible,
  movieId,
  cinemaId,
  onClose,
  onSelectShowtime,
}) => {
  const [cinema, setCinema] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showtimes, setShowtimes] = useState([]);

  // ✅ Tạo danh sách 7 ngày từ hôm nay
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split("T")[0]);
    }

    return days;
  }, []);

  useEffect(() => {
    if (!visible || !movieId || !cinemaId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // ✅ Gọi API mới - lấy suất chiếu 7 ngày tới theo cinema và movie
        const [movieData, cinemaData, showtimesData] = await Promise.all([
          movieService.getById(movieId),
          cinemaService.getById(cinemaId),
          showtimeService.getNext7Days(cinemaId, movieId),
        ]);

        setMovie(movieData);
        setCinema(cinemaData);
        setShowtimes(showtimesData || []);
        setSelectedDate(next7Days[0]);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        message.error("Không thể tải lịch chiếu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, movieId, cinemaId, next7Days]);

  /**
   * ✅ Nhóm suất chiếu theo ngày - sử dụng startTime thay vì showTime
   */
  const groupedShowtimes = useMemo(() => {
    if (!showtimes || showtimes.length === 0) return {};

    return showtimes.reduce((acc, st) => {
      const date = st.startTime?.split("T")[0];
      if (!date) return acc;

      if (!acc[date]) acc[date] = [];
      acc[date].push(st);
      return acc;
    }, {});
  }, [showtimes]);

  // ✅ Lấy showtimes cho ngày đang chọn + filter suất đã qua
  const currentShowtimes = useMemo(() => {
    if (!selectedDate) return [];

    const dayShowtimes = groupedShowtimes[selectedDate] || [];
    const today = new Date().toISOString().split("T")[0];

    // ✅ Nếu là ngày hôm nay → filter bỏ suất đã qua
    if (selectedDate === today) {
      const now = new Date();

      return dayShowtimes.filter((st) => {
        const showDateTime = new Date(st.startTime);
        return showDateTime > now;
      });
    }

    return dayShowtimes;
  }, [selectedDate, groupedShowtimes]);

  // ✅ Kiểm tra ngày có suất chiếu còn lại không (cho styling tab)
  const getAvailableShowtimesCount = (date) => {
    const dayShowtimes = groupedShowtimes[date] || [];
    const today = new Date().toISOString().split("T")[0];

    if (date === today) {
      const now = new Date();
      return dayShowtimes.filter((st) => new Date(st.startTime) > now).length;
    }

    return dayShowtimes.length;
  };

  const formatDateTab = (dateStr, index) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    if (index === 0) {
      return { day: "Hôm nay", date: `${day}/${month}` };
    }

    return { day: weekdays[date.getDay()], date: `${day}/${month}` };
  };

  // ✅ Click vào showtime - giờ có showtimeId trực tiếp, không cần lookup
  const handleShowtimeClick = (showtime) => {
    if (!showtime.showtimeId) {
      message.error("Không tìm thấy suất chiếu này");
      return;
    }

    onSelectShowtime(showtime.showtimeId);
  };

  if (!visible) return null;

  return (
    <Modal
      title={
        <div className="modal-title">
          <h3>Lịch chiếu phim</h3>
          {cinema && (
            <p className="cinema-info">
              <span className="cinema-dot"></span>
              Rạp {cinema.name}
            </p>
          )}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      className="schedule-modal-custom"
      destroyOnHidden
    >
      {loading ? (
        <div className="modal-loading">
          <Spin size="large" />
          <p>Đang kiểm tra lịch chiếu...</p>
        </div>
      ) : (
        <>
          {/* ✅ Custom Date Tabs */}
          <div className="date-tabs">
            {next7Days.map((date, index) => {
              const { day, date: dateStr } = formatDateTab(date, index);
              const isActive = selectedDate === date;
              const hasShowtimes = getAvailableShowtimesCount(date) > 0;

              return (
                <button
                  key={date}
                  className={`date-tab ${isActive ? "active" : ""} ${
                    !hasShowtimes ? "no-showtime" : ""
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="tab-day">{day}</span>
                  <span className="tab-date">{dateStr}</span>
                </button>
              );
            })}
          </div>

          {/* ✅ Nội dung */}
          <div className="schedule-content">
            {currentShowtimes.length > 0 ? (
              <div className="day-schedule">
                {currentShowtimes
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((st) => (
                    <button
                      key={st.showtimeId}
                      className="show-time"
                      onClick={() => handleShowtimeClick(st)}
                    >
                      <span className="time-text">
                        {st.startTime.split("T")[1].substring(0, 5)}
                      </span>
                      <span className="room-text"> - {st.roomName}</span>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="no-showtime-message">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có suất chiếu trong ngày này"
                />
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
};

ScheduleModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  movieId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  cinemaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectShowtime: PropTypes.func.isRequired,
};

export default ScheduleModal;
