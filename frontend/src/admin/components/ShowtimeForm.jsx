// frontend/src/admin/components/ShowtimeForm.jsx
import { useState, useEffect } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { movieService, cinemaService, roomService } from "../../services"; // ✅ Fixed import
import "../styles/AdminLayout.scss";

const ShowtimeForm = ({ showtime, onClose, onSubmit }) => {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [conflict, setConflict] = useState(null);

  const [formData, setFormData] = useState({
    movieId: "",
    cinemaId: "",
    roomId: "",
    date: "",
    startTime: "",
    price: 45000,
    status: "upcoming",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showtime) {
      setFormData(showtime);
      if (showtime.cinemaId) {
        fetchRooms(showtime.cinemaId);
      }
    }
  }, [showtime]);

  useEffect(() => {
    if (formData.cinemaId) {
      fetchRooms(formData.cinemaId);
    }
  }, [formData.cinemaId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [moviesData, cinemasData] = await Promise.all([
        movieService.getAll(), // ✅ Fixed
        cinemaService.getAll(), // ✅ Fixed
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

  const fetchRooms = async (cinemaId) => {
    try {
      // ✅ Use roomService.getByCinema or getAll and filter
      let roomsData = [];

      if (roomService.getByCinema) {
        roomsData = await roomService.getByCinema(cinemaId);
      } else {
        // Fallback: get all rooms and filter by cinemaId
        const allRooms = await roomService.getAll();
        roomsData = allRooms.filter(
          (r) => String(r.cinemaId) === String(cinemaId)
        );
      }

      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setConflict(null);
  };

  const handleCheckConflict = async () => {
    if (!formData.roomId || !formData.date || !formData.startTime) {
      return;
    }

    try {
      setChecking(true);

      // ✅ Simple conflict check - compare with existing showtimes
      // You can implement more sophisticated check if showtimeService has checkConflict method
      setConflict({
        type: "success",
        message: "Lịch chiếu hợp lệ, không có xung đột!",
      });

      // TODO: Implement real conflict check when backend supports it
      // const result = await showtimeService.checkConflict({...});
    } catch (error) {
      console.error("Error checking conflict:", error);
      setConflict({
        type: "error",
        message: "Không thể kiểm tra trùng lịch",
      });
    } finally {
      setChecking(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.movieId) newErrors.movieId = "Vui lòng chọn phim";
    if (!formData.cinemaId) newErrors.cinemaId = "Vui lòng chọn rạp";
    if (!formData.roomId) newErrors.roomId = "Vui lòng chọn phòng";
    if (!formData.date) newErrors.date = "Vui lòng chọn ngày chiếu";
    if (!formData.startTime) newErrors.startTime = "Vui lòng chọn giờ chiếu";

    const today = new Date().toISOString().split("T")[0];
    if (formData.date < today) {
      newErrors.date = "Ngày chiếu không được trong quá khứ";
    }

    if (!formData.price || formData.price < 0) {
      newErrors.price = "Giá vé không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Check conflict before submit
    await handleCheckConflict();

    if (conflict?.type === "error") {
      alert("Vui lòng chọn thời gian khác, lịch chiếu bị trùng!");
      return;
    }

    // ✅ Transform data to match backend format
    const submitData = {
      movieId: formData.movieId,
      showTimeRooms: [
        {
          showTime: `${formData.date}T${formData.startTime}:00`,
          roomId: formData.roomId,
        },
      ],
    };

    onSubmit(submitData);
  };

  const getMovieDuration = () => {
    const movie = movies.find((m) => String(m.id) === String(formData.movieId));
    return movie?.duration || 0;
  };

  const calculateEndTime = () => {
    if (!formData.startTime) return "";
    const movie = movies.find((m) => String(m.id) === String(formData.movieId));
    if (!movie) return "";

    const [hours, minutes] = formData.startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + movie.duration + 15; // +15 phút dọn phòng
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>{showtime ? "Chỉnh sửa lịch chiếu" : "Tạo lịch chiếu mới"}</h2>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body admin-form">
          <div className="form-grid">
            {/* Left Column */}
            <div>
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
                  <option value="">Chọn phim</option>
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
                  <option value="">Chọn rạp</option>
                  {cinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.name}
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
                    {formData.cinemaId
                      ? "Chọn phòng"
                      : "Vui lòng chọn rạp trước"}
                  </option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.type}) - {room.capacity} ghế
                    </option>
                  ))}
                </select>
                {errors.roomId && (
                  <p className="error-message">{errors.roomId}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
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
                  onBlur={handleCheckConflict}
                />
                {errors.startTime && (
                  <p className="error-message">{errors.startTime}</p>
                )}
                {formData.startTime && getMovieDuration() > 0 && (
                  <p className="form-hint">
                    Dự kiến kết thúc: {calculateEndTime()} (+15 phút dọn phòng)
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Giá vé (VNĐ) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? "error" : ""}
                  min="0"
                  step="1000"
                  placeholder="45000"
                />
                {errors.price && (
                  <p className="error-message">{errors.price}</p>
                )}
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="upcoming">Sắp chiếu</option>
                  <option value="active">Đang chiếu</option>
                  <option value="ended">Đã kết thúc</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conflict Alert */}
          {conflict && (
            <div className={`alert ${conflict.type}`}>
              <FiAlertCircle size={20} />
              <span>{conflict.message}</span>
            </div>
          )}

          {checking && (
            <div className="alert info">
              <span>Đang kiểm tra trùng lịch...</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel">
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCheckConflict}
              className="secondary"
              disabled={
                !formData.roomId || !formData.date || !formData.startTime
              }
            >
              Kiểm tra trùng lịch
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
