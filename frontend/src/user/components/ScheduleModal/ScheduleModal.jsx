import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Modal, Spin, message, Empty } from "antd";
import {
  showtimeService,
  cinemaService,
  movieService,
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
    if (!visible || !movieId || !cinemaId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [movieData, cinemaData, showtimeData] = await Promise.all([
          movieService.getById(movieId),
          cinemaService.getById(cinemaId),
          showtimeService.getByMovie(movieId),
        ]);

        setMovie(movieData);
        setCinema(cinemaData);

        const cinemaRoomIds = cinemaData.rooms?.map((r) => r.roomId) || [];
        const filteredShowtimes = showtimeData.filter((st) =>
          cinemaRoomIds.includes(st.roomId)
        );

        setShowtimes(filteredShowtimes);
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

  const groupedShowtimes = useMemo(() => {
    return showtimeService.groupByDate(showtimes);
  }, [showtimes]);

  const currentShowtimes = useMemo(() => {
    if (!selectedDate) return [];

    const dayShowtimes = groupedShowtimes[selectedDate] || [];
    const today = new Date().toISOString().split("T")[0];

    if (selectedDate === today) {
      const now = new Date();
      return dayShowtimes.filter((st) => new Date(st.startTime) > now);
    }

    return dayShowtimes;
  }, [selectedDate, groupedShowtimes]);

  const getAvailableCount = (date) => {
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

    return {
      day: index === 0 ? "Hôm nay" : weekdays[date.getDay()],
      date: `${day}/${month}`,
    };
  };

  const handleShowtimeClick = (showtime) => {
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
      destroyOnClose
    >
      {loading ? (
        <div className="modal-loading">
          <Spin size="large" />
          <p>Đang kiểm tra lịch chiếu...</p>
        </div>
      ) : (
        <>
          <div className="date-tabs">
            {next7Days.map((date, index) => {
              const { day, date: dateStr } = formatDateTab(date, index);
              const hasShowtimes = getAvailableCount(date) > 0;

              return (
                <button
                  key={date}
                  className={`date-tab ${
                    selectedDate === date ? "active" : ""
                  } ${!hasShowtimes ? "no-showtime" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="tab-day">{day}</span>
                  <span className="tab-date">{dateStr}</span>
                </button>
              );
            })}
          </div>

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
                      <span className="time-text">{st.time}</span>
                      <span className="room-text"> - {st.roomName}</span>
                    </button>
                  ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có suất chiếu trong ngày này"
              />
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
