import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { getCinemas } from "../services/cinemas";
import "../styles/AdminLayout.scss";

const RoomForm = ({ room, onClose, onSubmit }) => {
  const [cinemas, setCinemas] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    cinemaId: "",
    capacity: "",
    type: "2D",
    rows: 10,
    seatsPerRow: 12,
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (room) {
      setFormData(room);
    }
  }, [room]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const data = await getCinemas();
      setCinemas(data.cinemas || data);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên phòng không được để trống";
    if (!formData.cinemaId) newErrors.cinemaId = "Vui lòng chọn rạp";
    if (!formData.capacity || formData.capacity <= 0)
      newErrors.capacity = "Sức chứa phải lớn hơn 0";
    if (!formData.rows || formData.rows <= 0)
      newErrors.rows = "Số hàng phải lớn hơn 0";
    if (!formData.seatsPerRow || formData.seatsPerRow <= 0)
      newErrors.seatsPerRow = "Số ghế mỗi hàng phải lớn hơn 0";

    const totalSeats = formData.rows * formData.seatsPerRow;
    if (totalSeats > 300) {
      newErrors.rows = "Tổng số ghế không được vượt quá 300";
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</h2>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body admin-form">
          <div className="form-group">
            <label>
              Rạp chiếu <span className="required">*</span>
            </label>
            <select
              name="cinemaId"
              value={formData.cinemaId}
              onChange={handleChange}
              className={errors.cinemaId ? "error" : ""}
              disabled={room || loading}
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
              Tên phòng <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Phòng 1, RAP 01"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label>
              Loại phòng <span className="required">*</span>
            </label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
              <option value="ScreenX">ScreenX</option>
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Số hàng ghế <span className="required">*</span>
              </label>
              <input
                type="number"
                name="rows"
                value={formData.rows}
                onChange={handleChange}
                className={errors.rows ? "error" : ""}
                min="1"
                max="20"
                placeholder="10"
              />
              {errors.rows && <p className="error-message">{errors.rows}</p>}
            </div>

            <div className="form-group">
              <label>
                Ghế mỗi hàng <span className="required">*</span>
              </label>
              <input
                type="number"
                name="seatsPerRow"
                value={formData.seatsPerRow}
                onChange={handleChange}
                className={errors.seatsPerRow ? "error" : ""}
                min="1"
                max="20"
                placeholder="12"
              />
              {errors.seatsPerRow && (
                <p className="error-message">{errors.seatsPerRow}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              Sức chứa <span className="required">*</span>
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className={errors.capacity ? "error" : ""}
              placeholder={formData.rows * formData.seatsPerRow || "120"}
            />
            {errors.capacity && (
              <p className="error-message">{errors.capacity}</p>
            )}
            <p className="form-hint">
              Tự động: {formData.rows * formData.seatsPerRow} ghế
            </p>
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel">
              Hủy
            </button>
            <button type="submit" className="submit">
              {room ? "Cập nhật" : "Tạo phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
