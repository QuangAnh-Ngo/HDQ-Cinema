// frontend/src/user/pages/BookingHistory/BookingHistory.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Empty, message } from "antd";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiFilm,
  FiAlertCircle,
} from "react-icons/fi";
import { bookingService, authService } from "../../../services";
import "./BookingHistory.scss";

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = authService.getCurrentUser();

      if (!user?.memberId) {
        setError("Không tìm thấy thông tin người dùng");
        return;
      }

      const data = await bookingService.getByMember(user.memberId);

      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.createTime) - new Date(a.createTime)
      );

      setBookings(sorted);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Không thể tải lịch sử đặt vé");
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getBookingStatus = (showTime) => {
    if (!showTime) {
      return { label: "Đã thanh toán", className: "completed" };
    }

    const now = new Date();
    const showDate = new Date(showTime);

    if (showDate > now) {
      return { label: "Sắp chiếu", className: "upcoming" };
    }
    return { label: "Đã xem", className: "completed" };
  };

  if (loading) {
    return (
      <div className="booking-history-page">
        <div className="loading-container">
          <Spin size="large" />
          <p>Đang tải lịch sử đặt vé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history-page">
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <FiFilm className="header-icon" />
            <div>
              <h1>Lịch sử đặt vé</h1>
              <p>Xem lại các vé bạn đã đặt tại HDQ Cinema</p>
            </div>
          </div>
          <div className="booking-count">
            <span className="count">{bookings.length}</span>
            <span className="label">vé đã đặt</span>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="error-container">
            <Empty description={error} />
            <button className="retry-btn" onClick={fetchBookings}>
              Thử lại
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-container">
            <Empty
              description="Bạn chưa có vé nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <button className="browse-btn" onClick={() => navigate("/")}>
              Khám phá phim ngay
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const status = getBookingStatus(booking.showTime);
              const showDate = formatDate(booking.showTime);
              const showTimeStr = formatTime(booking.showTime);

              return (
                <div key={booking.id} className="booking-card">
                  {/* Status Badge */}
                  <div className={`status-badge ${status.className}`}>
                    {status.label}
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    {/* Left: Booking Info */}
                    <div className="booking-info">
                      <div className="booking-id">
                        <span className="label">Mã vé</span>
                        <span className="value">#{booking.id}</span>
                      </div>

                      {/* Ngày chiếu hoặc Ngày đặt */}
                      <div className="info-row">
                        <FiCalendar className="icon" />
                        <div className="info-content">
                          <span className="label">
                            {showDate ? "Ngày chiếu" : "Ngày đặt"}
                          </span>
                          <span className="value">
                            {showDate ||
                              formatDate(booking.createTime) ||
                              "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Giờ chiếu - chỉ hiện nếu có */}
                      {showTimeStr && (
                        <div className="info-row">
                          <FiClock className="icon" />
                          <div className="info-content">
                            <span className="label">Giờ chiếu</span>
                            <span className="value">{showTimeStr}</span>
                          </div>
                        </div>
                      )}

                      {/* Ghế */}
                      <div className="info-row">
                        <FiMapPin className="icon" />
                        <div className="info-content">
                          <span className="label">Ghế</span>
                          <div className="seats-list">
                            {booking.seats?.length > 0 ? (
                              booking.seats.map((seat, idx) => (
                                <span key={idx} className="seat-badge">
                                  {seat}
                                </span>
                              ))
                            ) : (
                              <span className="no-data">--</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price */}
                    <div className="booking-price">
                      <div className="price-info">
                        <div>
                          <span className="label">Tổng tiền</span>
                          <span className="amount">
                            {booking.totalPrice?.toLocaleString() || 0}đ
                          </span>
                        </div>
                      </div>

                      <div className="booking-time">
                        <span className="label">Đặt lúc</span>
                        <span className="value">
                          {formatDateTime(booking.createTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notice nếu thiếu showTime */}
                  {!booking.showTime && (
                    <div className="info-notice">
                      <FiAlertCircle size={14} />
                      <span>Thông tin suất chiếu đang được cập nhật</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
