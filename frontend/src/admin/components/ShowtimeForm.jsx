// frontend/src/admin/components/ShowtimeForm.jsx
import { useState, useEffect } from "react";
import { FiX, FiAlertCircle, FiCheck } from "react-icons/fi";
import { movieService, cinemaService } from "../../services";
import "../styles/ShowtimeForm.scss";

const ShowtimeForm = ({ showtime, onClose, onSubmit }) => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(null);

  const [formData, setFormData] = useState({
    movieId: "",
    cinemaId: "",
    roomId: "",
    date: "",
    startTime: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showtime) {
      // ✅ Parse existing showtime data - cấu trúc mới: showtime có trực tiếp các field
      const showTimeISO = showtime.showTime || "";
      const [date, time] = showTimeISO.split("T");

      setFormData({
        movieId: showtime.movieId || "",
        cinemaId: showtime.cinemaId || "",
        roomId: showtime.roomId || "",
        date: date || "",
        startTime: time?.substring(0, 5) || "",
      });

      // Load rooms for selected cinema
      if (showtime.cinemaId) {
        fetchRoomsByCinema(showtime.cinemaId);
      }
    }
  }, [showtime]);

  useEffect(() => {
    if (formData.cinemaId) {
      fetchRoomsByCinema(formData.cinemaId);
    } else {
      setRooms([]);
    }
  }, [formData.cinemaId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [moviesData, cinemasData] = await Promise.all([
        movieService.getAll(),
        cinemaService.getAll(),
      ]);

      setMovies(Array.isArray(moviesData) ? moviesData : []);
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMovies([]);
      setCinemas([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get rooms from cinema.rooms (API returns rooms inside cinema)
  const fetchRoomsByCinema = async (cinemaId) => {
    try {
      const cinema = cinemas.find((c) => String(c.id) === String(cinemaId));
      if (cinema?.rooms) {
        setRooms(cinema.rooms);
      } else {
        // Fallback: fetch cinema by ID
        const cinemaData = await cinemaService.getById(cinemaId);
        setRooms(cinemaData?.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear room when cinema changes
    if (name === "cinemaId") {
      setFormData((prev) => ({ ...prev, roomId: "" }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setConflict(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.movieId) newErrors.movieId = "Vui lòng chọn phim";
    if (!formData.cinemaId) newErrors.cinemaId = "Vui lòng chọn rạp";
    if (!formData.roomId) newErrors.roomId = "Vui lòng chọn phòng";
    if (!formData.date) newErrors.date = "Vui lòng chọn ngày chiếu";
    if (!formData.startTime) newErrors.startTime = "Vui lòng chọn giờ chiếu";

    const today = new Date().toISOString().split("T")[0];
    if (formData.date && formData.date < today) {
      newErrors.date = "Ngày chiếu không được trong quá khứ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // ✅ Transform data to match API format
    const submitData = {
      movieId: parseInt(formData.movieId, 10),
      showTimeRooms: [
        {
          showTime: `${formData.date}T${formData.startTime}:00`,
          roomId: parseInt(formData.roomId, 10),
        },
      ],
    };

    console.log("📤 Submitting showtime:", submitData);
    onSubmit(submitData);
  };

  const getMovieDuration = () => {
    const movie = movies.find((m) => String(m.id) === String(formData.movieId));
    return movie?.duration || 0;
  };

  const calculateEndTime = () => {
    if (!formData.startTime || !formData.movieId) return "";

    const movie = movies.find((m) => String(m.id) === String(formData.movieId));
    if (!movie?.duration) return "";

    const [hours, minutes] = formData.startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + movie.duration + 15; // +15 phút dọn phòng
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const getSelectedMovie = () => {
    return movies.find((m) => String(m.id) === String(formData.movieId));
  };

  return (
    <div className="modal-overlay">
      <div className="modal showtime-form-modal">
        <div className="modal-header">
          <h2>{showtime ? "Chỉnh sửa lịch chiếu" : "Tạo lịch chiếu mới"}</h2>
          <button onClick={onClose} type="button">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              <div className="form-group">
                <label>
                  Phim <span className="required">*</span>
                </label>
                <select
                  name="movieId"
                  value={formData.movieId}
                  onChange={handleChange}
                  className={errors.movieId ? "error" : ""}
                  disabled={loading}
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} ({movie.duration} phút)
                    </option>
                  ))}
                </select>
                {errors.movieId && (
                  <p className="error-message">{errors.movieId}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Rạp <span className="required">*</span>
                </label>
                <select
                  name="cinemaId"
                  value={formData.cinemaId}
                  onChange={handleChange}
                  className={errors.cinemaId ? "error" : ""}
                  disabled={loading}
                >
                  <option value="">-- Chọn rạp --</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name} - {cinema.district}, {cinema.city}
                    </option>
                  ))}
                </select>
                {errors.cinemaId && (
                  <p className="error-message">{errors.cinemaId}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Phòng chiếu <span className="required">*</span>
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className={errors.roomId ? "error" : ""}
                  disabled={!formData.cinemaId || rooms.length === 0}
                >
                  <option value="">
                    {!formData.cinemaId
                      ? "-- Vui lòng chọn rạp trước --"
                      : rooms.length === 0
                      ? "-- Rạp chưa có phòng --"
                      : "-- Chọn phòng --"}
                  </option>
                  {rooms.map((room) => (
                    <option key={room.roomId} value={room.roomId}>
                      {room.roomName}
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="error-message">{errors.roomId}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              <div className="form-group">
                <label>
                  Ngày chiếu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? "error" : ""}
                  min={new Date().toISOString().split("T")[0]}
                />
                {errors.date && <p className="error-message">{errors.date}</p>}
              </div>

              <div className="form-group">
                <label>
                  Giờ bắt đầu <span className="required">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={errors.startTime ? "error" : ""}
                />
                {errors.startTime && (
                  <p className="error-message">{errors.startTime}</p>
                )}
                {formData.startTime && getMovieDuration() > 0 && (
                  <p className="form-hint">
                    ⏱ Dự kiến kết thúc: <strong>{calculateEndTime()}</strong>{" "}
                    (+15 phút dọn phòng)
                  </p>
                )}
              </div>

              {/* Movie Info Summary */}
              {getSelectedMovie() && (
                <div className="movie-summary">
                  <h4>Thông tin phim</h4>
                  <p>
                    <strong>Tên:</strong> {getSelectedMovie().title}
                  </p>
                  <p>
                    <strong>Thời lượng:</strong> {getSelectedMovie().duration}{" "}
                    phút
                  </p>
                  <p>
                    <strong>Thể loại:</strong> {getSelectedMovie().genre}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Conflict Alert */}
          {conflict && (
            <div
              className={`alert ${
                conflict.type === "success" ? "success" : "danger"
              }`}
            >
              {conflict.type === "success" ? (
                <FiCheck size={20} />
              ) : (
                <FiAlertCircle size={20} />
              )}
              <span>{conflict.message}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel">
              Hủy
            </button>
            <button type="submit" className="submit">
              {showtime ? "Cập nhật" : "Tạo lịch chiếu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowtimeForm;
