import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import "../styles/AdminLayout.scss";
import "../styles/MovieForm.scss";

const MovieForm = ({ movie, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    releaseDate: "",
    director: "",
    genre: "",
    language: "Tiếng Việt",
    rating: "",
    trailer: "",
    poster: "",
    status: "coming_soon",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (movie) {
      setFormData(movie);
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
    if (!formData.releaseDate)
      newErrors.releaseDate = "Vui lòng chọn ngày khởi chiếu";
    if (!formData.genre.trim()) newErrors.genre = "Vui lòng chọn thể loại";
    if (!formData.poster.trim()) newErrors.poster = "Vui lòng nhập URL poster";

    // ✅ Validate URL format
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
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay movie-form-modal">
      <div className="modal large">
        <div className="modal-header">
          <h2>{movie ? "Chỉnh sửa phim" : "Thêm phim mới"}</h2>
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
                />
                {errors.duration && (
                  <p className="error-message">{errors.duration}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Ngày khởi chiếu <span className="required">*</span>
                </label>
                <input
                  type="date"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleChange}
                  className={errors.releaseDate ? "error" : ""}
                />
                {errors.releaseDate && (
                  <p className="error-message">{errors.releaseDate}</p>
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

              <div className="form-group">
                <label>Ngôn ngữ</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                >
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Phụ đề Việt">Phụ đề Việt</option>
                  <option value="Lồng tiếng">Lồng tiếng</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
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

                {/* ✅ Preview poster if URL is valid */}
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
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.poster;
                          return newErrors;
                        });
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Độ tuổi</label>
                <select
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                >
                  <option value="">Chọn độ tuổi</option>
                  <option value="P">P - Phổ biến</option>
                  <option value="K">K - Dưới 13 tuổi</option>
                  <option value="T13">T13 - Từ 13 tuổi</option>
                  <option value="T16">T16 - Từ 16 tuổi</option>
                  <option value="T18">T18 - Từ 18 tuổi</option>
                  <option value="C">C - Cấm chiếu</option>
                </select>
              </div>

              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="coming_soon">Sắp chiếu</option>
                  <option value="now_showing">Đang chiếu</option>
                  <option value="ended">Ngừng chiếu</option>
                </select>
              </div>

              <div className="form-group">
                <label>Link Trailer (YouTube)</label>
                <input
                  type="url"
                  name="trailer"
                  value={formData.trailer}
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
