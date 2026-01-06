// frontend/src/admin/pages/Bookings.jsx
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiX,
  FiDollarSign,
  FiClock,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import { bookingService } from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true); // ✅ Track permission
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let bookingsData = [];

      // ✅ Try to fetch bookings
      if (bookingService.getByDate) {
        const today = new Date();
        const dates = [];

        // Get last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split("T")[0]);
        }

        const results = await Promise.all(
          dates.map((date) =>
            bookingService.getByDate(date).catch((error) => {
              // ✅ Handle 403 specifically
              if (error.status === 403) {
                console.warn(`⚠️ No permission for bookings on ${date}`);
                setHasPermission(false);
              }
              return [];
            })
          )
        );

        bookingsData = results.flat();
      }

      // ✅ Show appropriate message
      if (!hasPermission) {
        message.warning({
          content:
            "Bạn không có quyền xem booking. Vui lòng đăng nhập với tài khoản thật.",
          duration: 5,
        });
      } else if (bookingsData.length === 0) {
        message.info("Chưa có booking nào trong 7 ngày qua");
      }

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      setStats({
        totalBookings: bookingsData.length,
        todayRevenue: bookingsData
          .filter((b) => b.createTime?.startsWith(today))
          .reduce((sum, b) => sum + (b.totalPrice || 0), 0),
        pendingCount: 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);

      if (error.status === 403) {
        setHasPermission(false);
        message.error({
          content:
            "Không có quyền truy cập. Vui lòng đăng nhập với tài khoản thật.",
          duration: 5,
        });
      } else {
        message.error("Lỗi khi tải dữ liệu");
      }

      setBookings([]);
      setStats({ totalBookings: 0, todayRevenue: 0, pendingCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((booking) =>
        booking.createTime?.startsWith(dateFilter)
      );
    }

    filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    setFilteredBookings(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading text="Đang tải danh sách đặt vé..." />;
  }

  return (
    <div className="admin-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý đặt vé</h1>
      </div>

      {/* ✅ Show permission warning */}
      {!hasPermission && (
        <div className="alert warning" style={{ marginBottom: 24 }}>
          <FiAlertCircle size={20} />
          <div>
            <strong>Không có quyền truy cập</strong>
            <p>
              Tính năng này yêu cầu đăng nhập với tài khoản thật. Mock
              authentication không được hỗ trợ cho endpoint booking.
            </p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng đặt vé</p>
              <h3>{stats?.totalBookings || 0}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Doanh thu hôm nay</p>
              <h3 style={{ color: "#10b981" }}>
                {(stats?.todayRevenue || 0).toLocaleString()}đ
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Trong 7 ngày qua</p>
              <h3 style={{ color: "#2563eb" }}>{stats?.totalBookings || 0}</h3>
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
              placeholder="Tìm kiếm mã booking, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="search-input date-filter">
            <FiCalendar size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-table">
        {filteredBookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Mã booking</th>
                <th>Khách hàng</th>
                <th>Suất chiếu</th>
                <th>Ghế</th>
                <th>Tổng tiền</th>
                <th>Thời gian đặt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong className="booking-code">{booking.id}</strong>
                  </td>
                  <td>{booking.username || "N/A"}</td>
                  <td>{formatDate(booking.showTime)}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {booking.seats?.slice(0, 3).map((seat, idx) => (
                        <span key={idx} className="badge info">
                          {seat}
                        </span>
                      ))}
                      {booking.seats?.length > 3 && (
                        <span className="badge gray">
                          +{booking.seats.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>
                      {booking.totalPrice?.toLocaleString() || 0}đ
                    </strong>
                  </td>
                  <td>{formatDate(booking.createTime)}</td>
                  <td>
                    <div className="actions">
                      <button className="view" title="Xem chi tiết">
                        <FiEye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            {!hasPermission
              ? "Không có quyền xem booking. Vui lòng đăng nhập với tài khoản thật."
              : "Không tìm thấy booking nào"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
