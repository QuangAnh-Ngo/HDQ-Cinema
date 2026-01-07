import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import "../styles/AdminLayout.scss";
import "../styles/MovieForm.scss";

const MovieForm = ({ movie, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    dayStart: "",
    dayEnd: "",
    director: "",
    genre: "",
    language: "Tiếng Việt",
    limitAge: "",
    trailer_url: "",
    poster: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || "",
        description: movie.description || "",
        duration: movie.duration || "",
        dayStart: movie.dayStart || "",
        dayEnd: movie.dayEnd || "",
        director: movie.director || "",
        genre: movie.genre || "",
        language: movie.language || "Tiếng Việt",
        limitAge: movie.limitAge || "",
        trailer_url: movie.trailer_url || "",
        poster: movie.poster || "",
      });
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim())
      newErrors.title = "Tên phim không được để trống";
    if (!formData.duration || formData.duration <= 0)
      newErrors.duration = "Thời lượng phải lớn hơn 0";
    if (!formData.dayStart)
      newErrors.dayStart = "Vui lòng chọn ngày bắt đầu chiếu";
    if (!formData.dayEnd)
      newErrors.dayEnd = "Vui lòng chọn ngày kết thúc chiếu";
    if (!formData.genre.trim()) newErrors.genre = "Vui lòng chọn thể loại";
    if (!formData.poster.trim()) newErrors.poster = "Vui lòng nhập URL poster";

    if (formData.dayStart && formData.dayEnd) {
      const start = new Date(formData.dayStart);
      const end = new Date(formData.dayEnd);
      if (end < start) {
        newErrors.dayEnd = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (formData.poster.trim()) {
      try {
        new URL(formData.poster);
      } catch {
        newErrors.poster = "URL poster không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        title: formData.title,
        poster: formData.poster,
        duration: parseInt(formData.duration, 10),
        limitAge: parseInt(formData.limitAge, 10) || 0,
        dayStart: formData.dayStart,
        dayEnd: formData.dayEnd,
        director: formData.director,
        genre: formData.genre,
        description: formData.description,
        trailer_url: formData.trailer_url,
      };

      console.log("📦 Submitting movie data:", submitData);
      onSubmit(submitData);
    }
  };

  return (
    <div className="modal-overlay movie-form-modal">
      <div className="modal large">
        <div className="modal-header">
          <h2>{movie ? "Chỉnh sửa phim" : "Thêm phim mới"}</h2>
          <button onClick={onClose} type="button">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body admin-form">
          <div className="form-grid">
            <div>
              <div className="form-group">
                <label>
                  Tên phim <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? "error" : ""}
                  placeholder="Nhập tên phim"
                />
                {errors.title && (
                  <p className="error-message">{errors.title}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Thời lượng (phút) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={errors.duration ? "error" : ""}
                  placeholder="120"
                  min="1"
                />
                {errors.duration && (
                  <p className="error-message">{errors.duration}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Ngày bắt đầu chiếu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="dayStart"
                  value={formData.dayStart}
                  onChange={handleChange}
                  className={errors.dayStart ? "error" : ""}
                />
                {errors.dayStart && (
                  <p className="error-message">{errors.dayStart}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Ngày kết thúc chiếu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="dayEnd"
                  value={formData.dayEnd}
                  onChange={handleChange}
                  className={errors.dayEnd ? "error" : ""}
                />
                {errors.dayEnd && (
                  <p className="error-message">{errors.dayEnd}</p>
                )}
              </div>

              <div className="form-group">
                <label>Đạo diễn</label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                  placeholder="Tên đạo diễn"
                />
              </div>

              <div className="form-group">
                <label>
                  Thể loại <span className="required">*</span>
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={errors.genre ? "error" : ""}
                >
                  <option value="">Chọn thể loại</option>
                  <option value="Hành động">Hành động</option>
                  <option value="Kinh dị">Kinh dị</option>
                  <option value="Hài">Hài</option>
                  <option value="Tình cảm">Tình cảm</option>
                  <option value="Khoa học viễn tưởng">
                    Khoa học viễn tưởng
                  </option>
                  <option value="Phiêu lưu">Phiêu lưu</option>
                  <option value="Hoạt hình">Hoạt hình</option>
                </select>
                {errors.genre && (
                  <p className="error-message">{errors.genre}</p>
                )}
              </div>
            </div>

            <div>
              <div className="form-group">
                <label>
                  URL Poster <span className="required">*</span>
                </label>
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleChange}
                  className={errors.poster ? "error" : ""}
                  placeholder="https://example.com/poster.jpg"
                />
                {errors.poster && (
                  <p className="error-message">{errors.poster}</p>
                )}

                {formData.poster && !errors.poster && (
                  <div className="poster-preview" style={{ marginTop: 12 }}>
                    <img
                      src={formData.poster}
                      alt="Poster preview"
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        setErrors((prev) => ({
                          ...prev,
                          poster: "Không thể tải ảnh từ URL này",
                        }));
                      }}
                      onLoad={(e) => {
                        e.target.style.display = "block";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Độ tuổi giới hạn</label>
                <select
                  name="limitAge"
                  value={formData.limitAge}
                  onChange={handleChange}
                >
                  <option value="0">P - Phổ biến</option>
                  <option value="13">T13 - Từ 13 tuổi</option>
                  <option value="16">T16 - Từ 16 tuổi</option>
                  <option value="18">T18 - Từ 18 tuổi</option>
                </select>
              </div>

              <div className="form-group">
                <label>Link Trailer (YouTube)</label>
                <input
                  type="url"
                  name="trailer_url"
                  value={formData.trailer_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả nội dung phim..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel">
              Hủy
            </button>
            <button type="submit" className="submit">
              {movie ? "Cập nhật" : "Thêm phim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
