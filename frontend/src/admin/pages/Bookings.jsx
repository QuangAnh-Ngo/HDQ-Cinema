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
} from "react-icons/fi";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import {
  getBookings,
  getBookingById,
  cancelBooking,
  confirmPayment,
  getBookingStats,
} from "../services/bookings";
import { toast } from "react-toastify";
import "../styles/AdminLayout.scss";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
      const [bookingsData, statsData] = await Promise.all([
        getBookings(),
        getBookingStats(),
      ]);
      setBookings(bookingsData.bookings || bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.movieTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((booking) => booking.showDate === dateFilter);
    }

    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredBookings(filtered);
  };

  const handleViewDetail = async (booking) => {
    try {
      const detail = await getBookingById(booking.id);
      setSelectedBooking(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      toast.error("Lỗi khi tải chi tiết đặt vé");
    }
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    try {
      await cancelBooking(bookingToCancel.id, "Admin hủy");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel.id ? { ...b, status: "cancelled" } : b
        )
      );
      toast.success("Hủy đặt vé thành công!");
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.message || "Có lỗi xảy ra khi hủy đặt vé!");
    }
  };

  const handleConfirmPayment = async (bookingId) => {
    try {
      await confirmPayment(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, paymentStatus: "paid" } : b
        )
      );
      toast.success("Xác nhận thanh toán thành công!");
    } catch (error) {
      console.error("Error confirming payment:", error);
      toast.error("Có lỗi xảy ra khi xác nhận thanh toán!");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "Chờ xác nhận", className: "warning" },
      confirmed: { label: "Đã xác nhận", className: "success" },
      cancelled: { label: "Đã hủy", className: "danger" },
      completed: { label: "Hoàn thành", className: "gray" },
    };

    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: { label: "Chưa thanh toán", className: "warning" },
      paid: { label: "Đã thanh toán", className: "success" },
      refunded: { label: "Đã hoàn tiền", className: "info" },
    };

    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
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
              <p>Chờ xác nhận</p>
              <h3 style={{ color: "#f59e0b" }}>
                {bookings.filter((b) => b.status === "pending").length}
              </h3>
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
              placeholder="Tìm mã vé, email, phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="search-input" style={{ maxWidth: "200px" }}>
            <FiCalendar size={20} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="admin-table">
        {filteredBookings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Mã vé</th>
                <th>Khách hàng</th>
                <th>Phim</th>
                <th>Suất chiếu</th>
                <th>Ghế</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.code}</strong>
                    <br />
                    <small style={{ color: "#6b7280" }}>
                      {formatDate(booking.createdAt)}
                    </small>
                  </td>
                  <td>
                    <div>
                      <p>{booking.userName || "N/A"}</p>
                      <small style={{ color: "#6b7280" }}>
                        {booking.userEmail}
                      </small>
                    </div>
                  </td>
                  <td>{booking.movieTitle || "N/A"}</td>
                  <td>
                    <div>
                      <p>
                        {new Date(booking.showDate).toLocaleDateString("vi-VN")}
                      </p>
                      <small style={{ color: "#6b7280" }}>
                        {booking.showTime} - {booking.roomName}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="badge info">
                      {booking.seats?.length || 0} ghế
                    </span>
                  </td>
                  <td>
                    <strong>{booking.totalAmount?.toLocaleString()}đ</strong>
                  </td>
                  <td>{getPaymentBadge(booking.paymentStatus)}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="view"
                        title="Xem chi tiết"
                      >
                        <FiEye size={18} />
                      </button>
                      {booking.paymentStatus === "pending" && (
                        <button
                          onClick={() => handleConfirmPayment(booking.id)}
                          className="edit"
                          title="Xác nhận thanh toán"
                        >
                          <FiCheckCircle size={18} />
                        </button>
                      )}
                      {booking.status === "pending" && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="delete"
                          title="Hủy vé"
                        >
                          <FiX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">Không tìm thấy đặt vé nào</div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Chi tiết đặt vé - {selectedBooking.code}</h2>
              <button onClick={() => setShowDetailModal(false)}>
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
                    <strong>Họ tên:</strong> {selectedBooking.userName}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedBooking.userEmail}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {selectedBooking.userPhone}
                  </p>
                </div>

                <div className="detail-section">
                  <h3>
                    <FiClock size={18} /> Thông tin suất chiếu
                  </h3>
                  <p>
                    <strong>Phim:</strong> {selectedBooking.movieTitle}
                  </p>
                  <p>
                    <strong>Rạp:</strong> {selectedBooking.cinemaName}
                  </p>
                  <p>
                    <strong>Phòng:</strong> {selectedBooking.roomName}
                  </p>
                  <p>
                    <strong>Ngày:</strong>{" "}
                    {new Date(selectedBooking.showDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                  <p>
                    <strong>Giờ:</strong> {selectedBooking.showTime}
                  </p>
                </div>

                <div className="detail-section">
                  <h3>Ghế đã chọn</h3>
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
                    <strong>Giá vé:</strong>{" "}
                    {selectedBooking.ticketPrice?.toLocaleString()}đ x{" "}
                    {selectedBooking.seats?.length}
                  </p>
                  {selectedBooking.discount > 0 && (
                    <p>
                      <strong>Giảm giá:</strong> -
                      {selectedBooking.discount?.toLocaleString()}đ
                    </p>
                  )}
                  <p>
                    <strong>Tổng cộng:</strong>{" "}
                    <span style={{ fontSize: "1.2em", color: "#10b981" }}>
                      {selectedBooking.totalAmount?.toLocaleString()}đ
                    </span>
                  </p>
                  <p>
                    <strong>Phương thức:</strong>{" "}
                    {selectedBooking.paymentMethod || "N/A"}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {getPaymentBadge(selectedBooking.paymentStatus)}
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="cancel"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancel}
        title="Xác nhận hủy vé"
        message={`Bạn có chắc chắn muốn hủy vé "${bookingToCancel?.code}"? Hành động này không thể hoàn tác.`}
        type="danger"
      />
    </div>
  );
};

export default Bookings;
