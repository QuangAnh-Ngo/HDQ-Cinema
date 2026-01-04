import { useState, useEffect } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import "../styles/AdminLayout.scss";
import "../styles/MovieForm.scss";

const MovieForm = ({ movie, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    releaseDate: "",
    director: "",
    cast: "",
    genre: "",
    language: "Tiếng Việt",
    rating: "",
    trailer: "",
    poster: "",
    status: "coming_soon",
  });

  const [posterPreview, setPosterPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (movie) {
      setFormData(movie);
      setPosterPreview(movie.poster);
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          poster: "Kích thước file không được vượt quá 5MB",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
        setFormData((prev) => ({ ...prev, poster: reader.result }));
      };
      reader.readAsDataURL(file);
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
    if (!posterPreview) newErrors.poster = "Vui lòng tải lên poster";

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
                <label>Diễn viên</label>
                <input
                  type="text"
                  name="cast"
                  value={formData.cast}
                  onChange={handleChange}
                  placeholder="Tên diễn viên (cách nhau bởi dấu phẩy)"
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

            {/* Right Column */}
            <div>
              <div className="form-group">
                <label>
                  Poster <span className="required">*</span>
                </label>
                <div className="poster-upload">
                  {posterPreview ? (
                    <div className="preview-container">
                      <img src={posterPreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => {
                          setPosterPreview("");
                          setFormData((prev) => ({ ...prev, poster: "" }));
                        }}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-area">
                      <FiUpload size={48} />
                      <span className="upload-text">Click để tải poster</span>
                      <span className="upload-hint">PNG, JPG (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
                {errors.poster && (
                  <p className="error-message">{errors.poster}</p>
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
                  placeholder="https://youtube.com/..."
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
