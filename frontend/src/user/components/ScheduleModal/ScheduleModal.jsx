// frontend/src/user/components/ScheduleModal/ScheduleModal.jsx
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Modal, Tabs, Spin, message, Empty } from "antd";
import { movieService, cinemaService } from "../../../services";
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

  /**
   * Tải thông tin rạp (để lấy tên phòng) và thông tin phim (để lấy suất chiếu)
   */
  useEffect(() => {
    if (!visible || !movieId || !cinemaId) {
      return; // Skip fetch nếu không đủ điều kiện
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [movieData, cinemaData] = await Promise.all([
          movieService.getById(movieId),
          cinemaService.getById(cinemaId),
        ]);

        setMovie(movieData);
        setCinema(cinemaData);

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
              className="show-time flex flex-col items-center justify-center h-auto py-2 group"
              onClick={() => onSelectShowtime(st.id || st.showTime)}
            >
              <span className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                {st.showTime.split("T")[1].substring(0, 5)}
              </span>
              <span className="text-[10px] text-gray-400 uppercase mt-1">
                {st.roomName}
              </span>
            </button>
          ))}
      </div>
    ),
  }));

  if (!visible) return null;

  return (
    <Modal
      title={
        <div className="modal-title border-b pb-4">
          <h3 className="text-2xl font-black uppercase text-gray-800">
            Lịch chiếu phim
          </h3>
          {cinema && (
            <p className="text-blue-600 font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
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
      destroyOnClose
    >
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Spin size="large" />
          <p className="mt-4 text-gray-400 italic font-medium">
            Đang kiểm tra lịch chiếu...
          </p>
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
        <div className="py-12">
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
