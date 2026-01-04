import { useState, useEffect } from "react";
import { FiX, FiMapPin } from "react-icons/fi";
import "../styles/AdminLayout.scss";

const CinemaForm = ({ cinema, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    description: "",
    facilities: [],
    latitude: "",
    longitude: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const facilitiesList = [
    "Bãi đỗ xe",
    "Căng tin",
    "Phòng game",
    "Wifi miễn phí",
    "Thang máy",
    "Ghế massage",
    "Phòng VIP",
    "3D/IMAX",
  ];

  useEffect(() => {
    if (cinema) {
      setFormData(cinema);
    }
  }, [cinema]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFacilityToggle = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Tên rạp không được để trống";
    if (!formData.address.trim())
      newErrors.address = "Địa chỉ không được để trống";
    if (!formData.city.trim()) newErrors.city = "Thành phố không được để trống";

    const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
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
      <div className="modal large">
        <div className="modal-header">
          <h2>{cinema ? "Chỉnh sửa rạp" : "Thêm rạp mới"}</h2>
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
                  Tên rạp <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "error" : ""}
                  placeholder="CGV Vincom Center"
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label>
                  Địa chỉ <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? "error" : ""}
                  placeholder="191 Bà Triệu, Hai Bà Trưng"
                />
                {errors.address && (
                  <p className="error-message">{errors.address}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Thành phố <span className="required">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? "error" : ""}
                >
                  <option value="">Chọn thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
                {errors.city && <p className="error-message">{errors.city}</p>}
              </div>

              <div className="form-group">
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "error" : ""}
                  placeholder="0123456789"
                />
                {errors.phone && (
                  <p className="error-message">{errors.phone}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  placeholder="cinema@example.com"
                />
                {errors.email && (
                  <p className="error-message">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="form-group">
                <label>Tiện nghi</label>
                <div className="checkbox-grid">
                  {facilitiesList.map((facility) => (
                    <label key={facility} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility)}
                        onChange={() => handleFacilityToggle(facility)}
                      />
                      <span>{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FiMapPin size={16} /> Tọa độ (Latitude)
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="21.0285"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiMapPin size={16} /> Tọa độ (Longitude)
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="105.8542"
                />
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
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả về rạp chiếu phim..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel">
              Hủy
            </button>
            <button type="submit" className="submit">
              {cinema ? "Cập nhật" : "Thêm rạp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CinemaForm;
