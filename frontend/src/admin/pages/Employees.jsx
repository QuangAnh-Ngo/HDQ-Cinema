import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit, FiLock, FiUnlock } from "react-icons/fi";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employees";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import EmployeeForm from "../components/EmployeeForm";
import { toast } from "react-toastify";
import "../styles/EmployeesPage.scss";

const Employees = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser.role === "admin";

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [empToUpdate, setEmpToUpdate] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);
  useEffect(() => {
    filterData();
  }, [employees, searchTerm, roleFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data.employees || []);
    } catch (error) {
      toast.error(error.message || "Không thể lấy danh sách nhân sự");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...employees];
    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((e) => e.role === roleFilter);
    }
    setFilteredEmployees(filtered);
  };

  const handleSubmit = async (data) => {
    try {
      if (selectedEmp) {
        const updated = await updateEmployee(selectedEmp.id, data);
        setEmployees((prev) =>
          prev.map((e) => (e.id === selectedEmp.id ? updated : e))
        );
        toast.success("Cập nhật thành công!");
      } else {
        const newEmp = await createEmployee(data);
        setEmployees((prev) => [...prev, newEmp]);
        toast.success("Thêm nhân sự mới thành công!");
      }
      setShowForm(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = (emp) => {
    setEmpToUpdate(emp);
    setShowStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    try {
      const newStatus = empToUpdate.status === "active" ? "inactive" : "active";
      const updated = await updateEmployee(empToUpdate.id, {
        ...empToUpdate,
        status: newStatus,
      });

      setEmployees((prev) =>
        prev.map((e) => (e.id === empToUpdate.id ? updated : e))
      );
      toast.success(
        `${newStatus === "active" ? "Mở khóa" : "Khóa"} tài khoản thành công!`
      );
      setShowStatusDialog(false);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  if (loading) return <Loading text="Đang tải danh sách nhân sự..." />;

  return (
    <div className="employees-page">
      <Breadcrumb />
      <div className="page-header">
        <h1>Quản lý nhân sự</h1>
        {isAdmin && (
          <button
            onClick={() => {
              setSelectedEmp(null);
              setShowForm(true);
            }}
            className="btn primary"
          >
            <FiPlus size={20} /> Thêm nhân sự
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <p>Tổng nhân sự</p>
            <h3>{employees.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p>Admin</p>
            <h3 style={{ color: "#ef4444" }}>
              {employees.filter((e) => e.role === "admin").length}
            </h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <p>Manager</p>
            <h3 style={{ color: "#2563eb" }}>
              {employees.filter((e) => e.role === "manager").length}
            </h3>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-content">
          <div className="search-input">
            <FiSearch size={20} />
            <input
              placeholder="Tìm theo tên, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tất cả chức vụ</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Username</th>
              <th>Email</th>
              <th>Chức vụ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td className="fw-bold">{emp.name}</td>
                <td>{emp.username}</td>
                <td>{emp.email}</td>
                <td>
                  <span
                    className={`badge ${
                      emp.role === "admin" ? "danger" : "info"
                    }`}
                  >
                    {emp.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      emp.status === "active" ? "success" : "gray"
                    }`}
                  >
                    {emp.status === "active" ? "Đang làm việc" : "Nghỉ việc"}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => {
                        setSelectedEmp(emp);
                        setShowForm(true);
                      }}
                      className="edit"
                    >
                      <FiEdit size={18} />
                    </button>

                    {/* Chỉ Admin mới có quyền Khóa/Mở khóa và không được tự khóa chính mình */}
                    {isAdmin &&
                      emp.username !== currentUser.username &&
                      emp.username !== "admin" && (
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={
                            emp.status === "active" ? "delete" : "view"
                          } // Dùng class delete cho màu đỏ (khóa), view cho màu xanh (mở)
                          title={
                            emp.status === "active"
                              ? "Khóa tài khoản"
                              : "Mở khóa tài khoản"
                          }
                        >
                          {emp.status === "active" ? (
                            <FiLock size={18} />
                          ) : (
                            <FiUnlock size={18} />
                          )}
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <EmployeeForm
          employee={selectedEmp}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}
      <ConfirmDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        onConfirm={confirmToggleStatus}
        title={
          empToUpdate?.status === "active"
            ? "Xác nhận khóa"
            : "Xác nhận mở khóa"
        }
        message={
          empToUpdate?.status === "active"
            ? `Bạn có chắc chắn muốn khóa tài khoản "${empToUpdate?.name}"? Nhân viên này sẽ không thể đăng nhập vào hệ thống.`
            : `Mở khóa cho tài khoản "${empToUpdate?.name}" để nhân viên này có thể tiếp tục làm việc?`
        }
        type={empToUpdate?.status === "active" ? "danger" : "info"}
      />
    </div>
  );
};

export default Employees;
