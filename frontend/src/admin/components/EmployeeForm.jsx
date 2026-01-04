import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

const EmployeeForm = ({ employee, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "manager",
    status: "active",
  });

  useEffect(() => {
    if (employee) setFormData({ ...employee, password: "" }); // Không hiển thị lại mật khẩu cũ
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay ">
      <div className="modal-content employee-form-modal">
        <div className="modal-header">
          <h2>{employee ? "Chỉnh sửa nhân sự" : "Thêm nhân sự mới"}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={!!employee}
            />
          </div>
          {!employee && (
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Chức vụ</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Đang làm việc</option>
                <option value="inactive">Đã nghỉ việc</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn gray" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn primary">
              Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
