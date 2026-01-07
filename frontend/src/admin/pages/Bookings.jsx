// frontend/src/admin/pages/Bookings.jsx
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiCalendar,
  FiAlertCircle,
  FiX,
  FiUser,
  FiClock,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import { bookingService } from "../../services";
import { message } from "antd";
import "../styles/AdminLayout.scss";
import "../styles/BookingsPage.scss";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Stats
  const [pendingCount, setPendingCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  // Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // ✅ Fetch pending count
      let pending = 0;
      try {
        pending = await bookingService.getPendingCount();
        setPendingCount(pending);
      } catch (error) {
        console.warn("Could not fetch pending count:", error);
      }

      // ✅ Fetch bookings by date
      let bookingsData = [];
      try {
        bookingsData = await bookingService.getByDate(dateFilter);
        setHasPermission(true);
      } catch (error) {
        if (error.status === 403) {
          setHasPermission(false);
          message.warning("Không có quyền xem booking");
        } else {
          console.error("Error fetching bookings:", error);
        }
        bookingsData = [];
      }

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setTotalBookings(bookingsData.length);

      // Calculate revenue
      const revenue = bookingsData.reduce(
        (sum, b) => sum + (b.totalPrice || 0),
        0
      );
      setTodayRevenue(revenue);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Lỗi khi tải dữ liệu");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          String(booking.id).toLowerCase().includes(search) ||
          booking.username?.toLowerCase().includes(search) ||
          booking.seats?.some((seat) => seat.toLowerCase().includes(search))
      );
    }

    // Sort by createTime (newest first)
    filtered.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    setFilteredBookings(filtered);
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading text="Đang tải danh sách đặt vé..." />;
  }

  return (
    <div className="admin-page bookings-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý đặt vé</h1>
      </div>

      {/* Permission Warning */}
      {!hasPermission && (
        <div className="page-notice warning">
          <FiAlertCircle size={18} />
          <span>
            Không có quyền truy cập. Vui lòng đăng nhập với tài khoản
            Admin/Manager.
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Booking ngày {formatDate(dateFilter).split(",")[1]}</p>
              <h3>{totalBookings}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Doanh thu</p>
              <h3 style={{ color: "#10b981" }}>
                {todayRevenue.toLocaleString()}đ
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Chờ thanh toán</p>
              <h3 style={{ color: "#f59e0b" }}>{pendingCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filters-content">
          <div className="search-input">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm mã booking, username, ghế..."
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

          <button className="btn secondary" onClick={fetchData}>
            Tải lại
          </button>
        </div>
      </div>

      {/* Table */}
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
                    <strong className="booking-code">#{booking.id}</strong>
                  </td>
                  <td>
                    <div className="user-cell">
                      <FiUser size={14} />
                      <span>{booking.username || "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="showtime-cell">
                      <FiClock size={14} />
                      <span>{formatTime(booking.showTime)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="seats-cell">
                      {booking.seats?.slice(0, 4).map((seat, idx) => (
                        <span key={idx} className="badge info">
                          {seat}
                        </span>
                      ))}
                      {booking.seats?.length > 4 && (
                        <span className="badge gray">
                          +{booking.seats.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong className="price-cell">
                      {booking.totalPrice?.toLocaleString() || 0}đ
                    </strong>
                  </td>
                  <td>
                    <span className="time-cell">
                      {formatDateTime(booking.createTime)}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="view"
                        title="Xem chi tiết"
                        onClick={() => handleViewDetail(booking)}
                      >
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
              ? "Không có quyền xem booking"
              : `Không có booking nào ngày ${formatDate(dateFilter)}`}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal booking-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chi tiết đặt vé #{selectedBooking.id}</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
                type="button"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-detail">
                <div className="detail-section">
                  <h3>
                    <FiUser size={18} /> Thông tin khách hàng
                  </h3>
                  <p>
                    <strong>Username:</strong>{" "}
                    {selectedBooking.username || "N/A"}
                  </p>
                </div>

                <div className="detail-section">
                  <h3>
                    <FiClock size={18} /> Thông tin suất chiếu
                  </h3>
                  <p>
                    <strong>Suất chiếu:</strong>{" "}
                    {formatDateTime(selectedBooking.showTime)}
                  </p>
                </div>

                <div className="detail-section">
                  <h3>
                    <FiMapPin size={18} /> Ghế đã đặt
                  </h3>
                  <div className="seats-grid">
                    {selectedBooking.seats?.map((seat, idx) => (
                      <span key={idx} className="badge info">
                        {seat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>
                    <FiDollarSign size={18} /> Thanh toán
                  </h3>
                  <p>
                    <strong>Tổng tiền:</strong>{" "}
                    <span className="price-highlight">
                      {selectedBooking.totalPrice?.toLocaleString()}đ
                    </span>
                  </p>
                  <p>
                    <strong>Thời gian đặt:</strong>{" "}
                    {formatDateTime(selectedBooking.createTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ Footer với nút đóng */}
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
