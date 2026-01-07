// frontend/src/admin/components/RoomForm.jsx
import { useState, useEffect } from "react";
import { FiX, FiAlertCircle, FiInfo } from "react-icons/fi";
import { cinemaService } from "../../services";
import "../styles/RoomForm.scss";

const RoomForm = ({ room, onClose, onSubmit, cinemas }) => {
  const [localCinemas, setLocalCinemas] = useState([]);
  const [formData, setFormData] = useState({
    roomName: "",
    cinemaId: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cinemas && cinemas.length > 0) {
      setLocalCinemas(cinemas);
    } else {
      fetchCinemas();
    }
  }, [cinemas]);

  useEffect(() => {
    if (room) {
      setFormData({
        roomName: room.roomName || room.name || "",
        cinemaId: room.cinemaId || "",
      });
    }
  }, [room]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const data = await cinemaService.getAll();
      setLocalCinemas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching cinemas:", error);
      setLocalCinemas([]);
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

    if (!formData.roomName.trim()) {
      newErrors.roomName = "Tên phòng không được để trống";
    }
    if (!formData.cinemaId) {
      newErrors.cinemaId = "Vui lòng chọn rạp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        roomName: formData.roomName.trim(),
        cinemaId: parseInt(formData.cinemaId, 10),
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal room-form-modal">
        <div className="modal-header">
          <h2>{room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}</h2>
          <button onClick={onClose} type="button">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* ✅ Thông báo nếu đang edit */}
          {room && (
            <div className="form-notice warning">
              <FiAlertCircle size={18} />
              <span>Chức năng chỉnh sửa phòng đang được phát triển</span>
            </div>
          )}

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
              <option value="">-- Chọn rạp --</option>
              {localCinemas.map((cinema) => (
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
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              className={errors.roomName ? "error" : ""}
              placeholder="VD: Phòng 1, RAP 01, Screen A..."
              disabled={room}
            />
            {errors.roomName && (
              <p className="error-message">{errors.roomName}</p>
            )}
            <p className="form-hint">
              Tên phòng sẽ hiển thị khi khách hàng đặt vé
            </p>
          </div>

          {/* ✅ Info Box */}
          <div className="info-box">
            <h4>
              <FiInfo /> Lưu ý
            </h4>
            <p>
              Sau khi tạo phòng, bạn có thể thiết lập sơ đồ ghế ngồi trong phần
              quản lý ghế (chức năng đang phát triển).
            </p>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel">
              Hủy
            </button>
            <button type="submit" className="submit" disabled={room}>
              {room ? "Cập nhật" : "Tạo phòng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomForm;
