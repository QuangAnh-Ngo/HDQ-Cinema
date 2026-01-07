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
  const [showtimesMap, setShowtimesMap] = useState({});

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
        const [movieData, cinemaData, allShowtimes] = await Promise.all([
          movieService.getById(movieId),
          cinemaService.getById(cinemaId),
          showtimeService.getAll(),
        ]);

        setMovie(movieData);
        setCinema(cinemaData);

        const numericMovieId = Number(movieId);

        const stMap = {};
        allShowtimes.forEach((st) => {
          if (Number(st.movieId) === numericMovieId) {
            st.showTimeRooms?.forEach((str) => {
              const key = `${str.showTime}_${str.roomId}`;
              stMap[key] = st.showtimeId;
            });
          }
        });

        setShowtimesMap(stMap);
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
   * Nhóm suất chiếu theo ngày
   */
  const groupedShowtimes = useMemo(() => {
    if (!movie?.showtimes || !cinema?.rooms) return {};

    const roomMap = {};
    cinema.rooms.forEach((r) => {
      roomMap[r.roomId] = r.roomName;
    });
    const roomIds = cinema.rooms.map((r) => r.roomId);

    return movie.showtimes
      .filter((st) => roomIds.includes(st.roomId))
      .reduce((acc, st) => {
        const date = st.showTime.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push({
          ...st,
          roomName: roomMap[st.roomId] || "Phòng chiếu",
        });
        return acc;
      }, {});
  }, [movie, cinema]);

  // ✅ Lấy showtimes cho ngày đang chọn + filter suất đã qua
  const currentShowtimes = useMemo(() => {
    if (!selectedDate) return [];

    const showtimes = groupedShowtimes[selectedDate] || [];
    const today = new Date().toISOString().split("T")[0];

    // ✅ Nếu là ngày hôm nay → filter bỏ suất đã qua
    if (selectedDate === today) {
      const now = new Date();

      return showtimes.filter((st) => {
        const showDateTime = new Date(st.showTime);
        return showDateTime > now;
      });
    }

    return showtimes;
  }, [selectedDate, groupedShowtimes]);

  // ✅ Kiểm tra ngày có suất chiếu còn lại không (cho styling tab)
  const getAvailableShowtimesCount = (date) => {
    const showtimes = groupedShowtimes[date] || [];
    const today = new Date().toISOString().split("T")[0];

    if (date === today) {
      const now = new Date();
      return showtimes.filter((st) => new Date(st.showTime) > now).length;
    }

    return showtimes.length;
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

  const handleShowtimeClick = (showtime) => {
    const key = `${showtime.showTime}_${showtime.roomId}`;
    const showtimeId = showtimesMap[key];

    if (!showtimeId) {
      message.error("Không tìm thấy suất chiếu này");
      return;
    }

    onSelectShowtime(showtimeId);
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
              // ✅ Dùng function mới để check có suất còn lại không
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
                  .sort((a, b) => a.showTime.localeCompare(b.showTime))
                  .map((st, idx) => (
                    <button
                      key={idx}
                      className="show-time"
                      onClick={() => handleShowtimeClick(st)}
                    >
                      <span className="time-text">
                        {st.showTime.split("T")[1].substring(0, 5)}
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
