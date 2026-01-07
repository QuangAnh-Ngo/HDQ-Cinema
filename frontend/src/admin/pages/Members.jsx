import { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import { memberService } from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [hasPermission, setHasPermission] = useState(true);
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAll();

      console.log("✅ Members loaded:", data.length);
      setMembers(Array.isArray(data) ? data : []);
      setHasPermission(true);
    } catch (error) {
      console.error("Error fetching members:", error);

      if (error.status === 403) {
        setHasPermission(false);
        message.warning({
          content:
            "Bạn không có quyền xem danh sách thành viên. Chỉ ADMIN mới có quyền này.",
          duration: 5,
        });
      } else {
        message.error("Không thể lấy danh sách thành viên");
      }

      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;

    const lowerSearch = searchTerm.toLowerCase();
    return members.filter(
      (member) =>
        member.username?.toLowerCase().includes(lowerSearch) ||
        member.email?.toLowerCase().includes(lowerSearch) ||
        member.phoneNumber?.includes(searchTerm) ||
        member.firstName?.toLowerCase().includes(lowerSearch) ||
        member.lastName?.toLowerCase().includes(lowerSearch)
    );
  }, [members, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: members.length,
      filtered: filteredMembers.length,
    };
  }, [members, filteredMembers]);

  const handleDeleteMember = (member) => {
    setMemberToDelete(member);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const memberId = memberToDelete.username || memberToDelete.id;

      await memberService.delete(memberId);

      setMembers((prev) =>
        prev.filter((m) => m.username !== memberToDelete.username)
      );

      message.success("Xóa thành viên thành công!");
      setShowDeleteDialog(false);
      setMemberToDelete(null);

      setTimeout(() => {
        fetchMembers();
      }, 500);
    } catch (error) {
      console.error("Error deleting member:", error);
      message.error(error.message || "Có lỗi xảy ra khi xóa thành viên!");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return <Loading text="Đang tải danh sách thành viên..." />;
  }

  if (!hasPermission) {
    return (
      <div className="admin-page">
        <Breadcrumb />
        <div className="page-header">
          <h1>Quản lý thành viên</h1>
        </div>

        <div
          className="empty-state"
          style={{
            padding: "60px 20px",
            textAlign: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            margin: "24px 0",
          }}
        >
          <FiUser size={48} color="#d1d5db" />
          <h3 style={{ marginTop: 16, color: "#6b7280" }}>
            Không có quyền truy cập
          </h3>
          <p style={{ color: "#9ca3af", marginTop: 8 }}>
            Bạn không có quyền xem danh sách thành viên.
            <br />
            Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý thành viên</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng thành viên</p>
              <h3>{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Kết quả tìm kiếm</p>
              <h3 style={{ color: "#2563eb" }}>{stats.filtered}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-content">
          <div className="search-input">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm username, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-table">
        {filteredMembers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày sinh</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.username}>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FiUser size={16} color="#6b7280" />
                      <strong>{member.username}</strong>
                    </div>
                  </td>
                  <td>
                    {member.firstName && member.lastName
                      ? `${member.firstName} ${member.lastName}`
                      : "N/A"}
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FiMail size={14} color="#6b7280" />
                      {member.email}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FiPhone size={14} color="#6b7280" />
                      {member.phoneNumber || "N/A"}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FiCalendar size={14} color="#6b7280" />
                      {formatDate(member.dob)}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="delete"
                        title="Xóa thành viên"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            {searchTerm
              ? "Không tìm thấy thành viên nào"
              : "Chưa có thành viên nào"}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa thành viên"
        message={`Bạn có chắc chắn muốn xóa thành viên "${memberToDelete?.username}"? Hành động này không thể hoàn tác.`}
        type="danger"
      />
    </div>
  );
};

export default Members;
