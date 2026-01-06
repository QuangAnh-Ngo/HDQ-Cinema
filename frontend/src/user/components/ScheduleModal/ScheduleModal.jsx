// frontend/src/user/components/ScheduleModal/ScheduleModal.jsx
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Modal, Tabs, Spin, message, Empty } from "antd";
import {
  movieService,
  cinemaService,
  showtimeService,
} from "../../../services"; // ✅ Import showtimeService
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
  const [showtimesMap, setShowtimesMap] = useState({}); // ✅ Map showTime+roomId -> showtimeId

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
          showtimeService.getAll(), // ✅ Fetch all showtimes để lấy ID
        ]);

        setMovie(movieData);
        setCinema(cinemaData);

        // ✅ Tạo map từ showTime+roomId -> showtimeId
        const stMap = {};
        allShowtimes.forEach((st) => {
          if (st.movieId === movieId) {
            st.showTimeRooms?.forEach((str) => {
              const key = `${str.showTime}_${str.roomId}`;
              stMap[key] = st.showtimeId;
            });
          }
        });
        setShowtimesMap(stMap);
        console.log("🗺️ Showtimes map:", stMap);

        // Lấy danh sách ngày có suất chiếu tại rạp này
        if (movieData.showtimes && cinemaData.rooms) {
          const roomIds = cinemaData.rooms.map((r) => r.roomId);
          const filtered = movieData.showtimes.filter((st) =>
            roomIds.includes(st.roomId)
          );

          if (filtered.length > 0) {
            const firstDate = filtered[0].showTime.split("T")[0];
            setSelectedDate(firstDate);
          }
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
        message.error("Không thể tải lịch chiếu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, movieId, cinemaId]);

  /**
   * Nhóm suất chiếu theo ngày và ánh xạ tên phòng
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

  const availableDates = Object.keys(groupedShowtimes).sort();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return `${day}/${month} - ${weekdays[date.getDay()]}`;
  };

  /**
   * ✅ Handle showtime selection
   */
  const handleShowtimeClick = (showtime) => {
    console.log("🔘 Clicked showtime:", showtime);

    // ✅ Tạo key để lookup showtimeId
    const key = `${showtime.showTime}_${showtime.roomId}`;
    const showtimeId = showtimesMap[key];

    console.log("🔑 Looking up key:", key);
    console.log("🎯 Found showtimeId:", showtimeId);

    if (!showtimeId) {
      message.error("Không tìm thấy suất chiếu này");
      return;
    }

    onSelectShowtime(showtimeId);
  };

  const dateTabs = availableDates.map((date) => ({
    key: date,
    label: formatDate(date),
    children: (
      <div className="day-schedule">
        {groupedShowtimes[date]
          .sort((a, b) => a.showTime.localeCompare(b.showTime))
          .map((st, idx) => (
            <button
              key={idx}
              className="show-time"
              onClick={() => handleShowtimeClick(st)} // ✅ Call handler
            >
              <span className="time-text">
                {st.showTime.split("T")[1].substring(0, 5)}
              </span>
              <span className="room-text"> - {st.roomName}</span>
            </button>
          ))}
      </div>
    ),
  }));

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
      width={800}
      centered
      className="schedule-modal-custom"
      destroyOnHidden // ✅ Fix warning
    >
      {loading ? (
        <div className="modal-loading">
          <Spin size="large" />
          <p>Đang kiểm tra lịch chiếu...</p>
        </div>
      ) : availableDates.length > 0 ? (
        <Tabs
          activeKey={selectedDate}
          onChange={setSelectedDate}
          items={dateTabs}
          centered
          className="week-schedule-tabs"
        />
      ) : (
        <div className="modal-empty">
          <Empty description="Rạp này hiện chưa có suất chiếu cho phim đã chọn" />
        </div>
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
