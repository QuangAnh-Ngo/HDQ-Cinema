// frontend/src/admin/components/CinemaForm.jsx
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import "../styles/AdminLayout.scss";

const CinemaForm = ({ cinema, onClose, onSubmit }) => {
  // ✅ Only fields that match API: name, city, district, address
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    district: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ Vietnam cities and districts
  const citiesData = {
    "Hà Nội": [
      "Ba Đình",
      "Hoàn Kiếm",
      "Hai Bà Trưng",
      "Đống Đa",
      "Cầu Giấy",
      "Thanh Xuân",
      "Hoàng Mai",
      "Long Biên",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
    ],
    "Hồ Chí Minh": [
      "Quận 1",
      "Quận 3",
      "Quận 5",
      "Quận 7",
      "Quận 10",
      "Bình Thạnh",
      "Phú Nhuận",
      "Tân Bình",
      "Gò Vấp",
      "Thủ Đức",
    ],
    "Đà Nẵng": [
      "Hải Châu",
      "Thanh Khê",
      "Sơn Trà",
      "Ngũ Hành Sơn",
      "Liên Chiểu",
      "Cẩm Lệ",
    ],
    "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt"],
    "Hải Phòng": ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Kiến An", "Hải An"],
  };

  useEffect(() => {
    if (cinema) {
      setFormData({
        name: cinema.name || "",
        city: cinema.city || "",
        district: cinema.district || "",
        address: cinema.address || "",
      });
    }
  }, [cinema]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset district when city changes
    if (name === "city") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        district: "", // Reset district
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên rạp không được để trống";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Vui lòng chọn thành phố";
    }

    if (!formData.district.trim()) {
      newErrors.district = "Vui lòng chọn quận/huyện";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // ✅ Submit only API-required fields
      const submitData = {
        name: formData.name.trim(),
        city: formData.city,
        district: formData.district,
        address: formData.address.trim(),
      };

      console.log("📤 Submitting cinema:", submitData);
      onSubmit(submitData);
    }
  };

  // Get available districts based on selected city
  const availableDistricts = formData.city
    ? citiesData[formData.city] || []
    : [];

  return (
    <div className="modal-overlay">
      <div className="modal medium">
        <div className="modal-header">
          <h2>{cinema ? "Chỉnh sửa rạp" : "Thêm rạp mới"}</h2>
          <button onClick={onClose} type="button">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body admin-form">
          {/* Tên rạp */}
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
              placeholder="VD: CGV Vincom Center Bà Triệu"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          {/* City & District - 2 columns */}
          <div
            className="form-row"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {/* Thành phố */}
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
                {Object.keys(citiesData).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="error-message">{errors.city}</p>}
            </div>

            {/* Quận/Huyện */}
            <div className="form-group">
              <label>
                Quận/Huyện <span className="required">*</span>
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className={errors.district ? "error" : ""}
                disabled={!formData.city}
              >
                <option value="">
                  {formData.city ? "Chọn quận/huyện" : "Chọn thành phố trước"}
                </option>
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="error-message">{errors.district}</p>
              )}
            </div>
          </div>

          {/* Địa chỉ chi tiết */}
          <div className="form-group">
            <label>
              Địa chỉ chi tiết <span className="required">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error" : ""}
              placeholder="VD: 191 Bà Triệu, Tầng 6 TTTM Vincom"
            />
            {errors.address && (
              <p className="error-message">{errors.address}</p>
            )}
          </div>

          {/* Preview */}
          {formData.name &&
            formData.city &&
            formData.district &&
            formData.address && (
              <div
                className="preview-box"
                style={{
                  padding: 16,
                  backgroundColor: "#f8fafc",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  marginTop: 8,
                }}
              >
                <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                  <strong>Xem trước:</strong>
                </p>
                <p
                  style={{ margin: "8px 0 0", fontSize: 15, color: "#1e293b" }}
                >
                  <strong>{formData.name}</strong>
                  <br />
                  {formData.address}, {formData.district}, {formData.city}
                </p>
              </div>
            )}

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
