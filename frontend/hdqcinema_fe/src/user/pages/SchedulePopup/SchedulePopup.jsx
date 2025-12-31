import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { getMovieById, getShowtimes, getCinemaById } from "../../services/api";
import dayjs from "dayjs";
import "./SchedulePopup.scss";

const SchedulePopup = ({ id: movieId, onClose }) => {
  const location = useLocation();
  const cinemaId = location.state?.cinema_id;

  const [cinema, setCinema] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("2025-10-05");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCinema = async () => {
      try {
        const cinemaData = await getCinemaById(cinemaId);
        setCinema(cinemaData);
      } catch (error) {
        console.error("Error fetching cinema:", error);
      }
    };
    fetchCinema();
  }, [cinemaId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const movieData = await getMovieById(movieId);
        const showtimeData = await getShowtimes(movieId, cinemaId);
        setMovie(movieData);
        setShowtimes(showtimeData);
      } catch (error) {
        console.error("Error fetching movie or showtime:", error);
      }
    };
    fetchData();
  }, [movieId, cinemaId]);

  if (!movie || !cinema) return null;

  // Tạo danh sách ngày trong tuần 20–26/10/2025
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs("2025-10-05").add(i, "day");
    const weekdayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return {
      label: `${d.format("DD/MM")} - ${weekdayNames[d.day()]}`,
      value: d.format("YYYY-MM-DD"),
      displayValue: d.format("DD-MM-YYYY"),
    };
  });

  const selectedSchedule = showtimes
    .filter((sch) => sch.start_time.startsWith(selectedDate))
    .map((sch) => ({
      time: new Date(sch.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      roomId: sch.room_id,
      showtimeId: sch.showtime_id,
    }));

  const handleShowtimeClick = (time, roomId, showtimeId) => {
    navigate("/seat-selection", {
      state: { movieId: movieId, date: selectedDate, time, roomId, showtimeId },
    });
    onClose();
  };

  return (
    <div className="popup-schedule" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-popup" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h3>
          LỊCH CHIẾU - <span>{movie.title}</span>
        </h3>
        <hr />

        <h2>
          Rạp <span>{cinema.name}</span>
        </h2>
        <hr />

        <div className="week-schedule">
          {weekDays.map((day) => (
            <a
              key={day.value}
              className={`day-of-week ${
                day.value === selectedDate ? "active" : ""
              }`}
              onClick={() => setSelectedDate(day.value)}
            >
              {day.label}
            </a>
          ))}
        </div>

        <div className="day-schedule">
          {selectedSchedule.length > 0 ? (
            selectedSchedule.map((sch, i) => (
              <a
                key={i}
                className="show-time"
                onClick={() =>
                  handleShowtimeClick(sch.time, sch.roomId, sch.showtimeId)
                }
              >
                {sch.time}
              </a>
            ))
          ) : (
            <p className="no-showtime">Không có suất chiếu cho ngày này</p>
          )}
        </div>
      </div>
    </div>
  );
};

SchedulePopup.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SchedulePopup;
