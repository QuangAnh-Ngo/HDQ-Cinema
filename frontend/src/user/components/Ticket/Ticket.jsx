import { Card, Button, Spin, Tag } from "antd";
import PropTypes from "prop-types";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  HomeOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import "./Ticket.scss";

const Ticket = ({
  movie,
  showtime,
  roomInfo,
  selectedSeats,
  priceInfo,
  onContinue,
}) => {
  if (!movie || !roomInfo) {
    return (
      <Card className="ticket-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  const getShowTimeDate = () => {
    const timeStr =
      showtime?.showTime || showtime?.time || new Date().toISOString();
    return new Date(timeStr);
  };

  const dateObj = getShowTimeDate();
  const formattedDate = dateObj.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const seatsByType = selectedSeats.reduce((acc, seat) => {
    const type = seat.seatType || "CLASSIC";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(seat);
    return acc;
  }, {});

  const totalSeats = selectedSeats.length;

  return (
    <Card className="ticket-container shadow-2xl border-none rounded-3xl overflow-hidden">
      <div className="ticket-detail">
        <div className="movie-detail">
          <div className="movie-poster">
            <img
              src={movie.poster}
              alt={movie.title}
              onError={(e) => {
                e.target.src = "/placeholder-poster.jpg";
              }}
            />
            <div className="poster-overlay">
              <VideoCameraOutlined className="poster-icon" />
            </div>
          </div>

          <h3 className="movie-title">{movie.title}</h3>

          <div className="movie-badges">
            <Tag color="red" className="age-badge">
              T{movie.limitAge}
            </Tag>
            <Tag className="duration-badge">
              <ClockCircleOutlined /> {movie.duration} phút
            </Tag>
          </div>
        </div>

        <div className="divider" />

        <div className="showtime-info">
          <div className="info-row">
            <HomeOutlined className="info-icon" />
            <div className="info-content">
              <span className="info-label">Rạp</span>
              <span className="info-value">{roomInfo.cinemaName}</span>
            </div>
          </div>

          <div className="info-row">
            <VideoCameraOutlined className="info-icon" />
            <div className="info-content">
              <span className="info-label">Phòng</span>
              <span className="info-value">{roomInfo.roomName}</span>
            </div>
          </div>

          <div className="info-row">
            <CalendarOutlined className="info-icon" />
            <div className="info-content">
              <span className="info-label">Ngày chiếu</span>
              <span className="info-value">{formattedDate}</span>
            </div>
          </div>

          <div className="info-row">
            <ClockCircleOutlined className="info-icon" />
            <div className="info-content">
              <span className="info-label">Giờ chiếu</span>
              <span className="info-value highlight">{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="selected-seats-section">
          <h4 className="section-title">Ghế đã chọn ({totalSeats})</h4>

          {totalSeats > 0 ? (
            <>
              {Object.entries(seatsByType).map(([type, seats]) => (
                <div key={type} className="seat-group">
                  <div className="seat-type-header">
                    <span className="seat-type-label">
                      {type === "VIP" ? "🌟 Ghế VIP" : "💺 Ghế thường"}
                    </span>
                    <span className="seat-count">({seats.length})</span>
                  </div>

                  <div className="seat-list">
                    {seats.map((seat) => (
                      <div key={seat.seatId} className="seat-item">
                        <span className="seat-name">{seat.seatName}</span>
                        <span className="seat-price">
                          {formatCurrency(seat.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="empty-seats">
              <p>Chưa chọn ghế nào</p>
            </div>
          )}
        </div>

        <div className="divider thick" />

        <div className="price-summary">
          <div className="price-row subtotal">
            <span>Tạm tính</span>
            <span>{formatCurrency(priceInfo?.totalPrice || 0)}</span>
          </div>

          <div className="price-row total">
            <span>Tổng cộng</span>
            <span className="total-amount">
              {formatCurrency(priceInfo?.totalPrice || 0)}
            </span>
          </div>
        </div>

        <div className="button-container">
          <Button
            type="primary"
            size="large"
            block
            className="payment-btn"
            onClick={onContinue}
            disabled={!selectedSeats || selectedSeats.length === 0}
          >
            {selectedSeats && selectedSeats.length > 0
              ? `Tiếp tục thanh toán (${selectedSeats.length} ghế)`
              : "Vui lòng chọn ghế"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

Ticket.propTypes = {
  movie: PropTypes.object,
  showtime: PropTypes.object,
  roomInfo: PropTypes.object,
  selectedSeats: PropTypes.array,
  priceInfo: PropTypes.object,
  onContinue: PropTypes.func.isRequired,
};

export default Ticket;
