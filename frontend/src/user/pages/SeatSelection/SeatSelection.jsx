import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spin, message, Button } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { seatService, movieService, cinemaService } from "../../../services";
import SeatMap from "../../components/SeatMap/SeatMap";
import "./SeatSelection.scss";

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("🔍 Location state:", location.state);

  const { showtimeId, movieId, cinemaId } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [movie, setMovie] = useState(null);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!showtimeId || !movieId || !cinemaId) {
        console.error("❌ Missing required params:", {
          showtimeId,
          movieId,
          cinemaId,
        });
        message.error("Thông tin không đầy đủ để hiển thị trang chọn ghế");
        navigate("/");
        return;
      }

      setLoading(true);
      try {
        const [movieData, roomResponse] = await Promise.all([
          movieService.getById(movieId),
          seatService.getSeatsByShowtime(showtimeId),
        ]);

        console.log("🎬 Movie data:", movieData);
        console.log("🏢 Room response:", roomResponse);

        if (!roomResponse) {
          message.error(
            "Không tìm thấy thông tin phòng chiếu cho suất chiếu này"
          );
          console.error("❌ Room response is null");
          navigate("/");
          return;
        }

        if (!roomResponse.seats || roomResponse.seats.length === 0) {
          message.warning(
            "Suất chiếu này chưa có ghế. Vui lòng chọn suất chiếu khác."
          );
          console.warn("⚠️ No seats found for this showtime");
        }

        setMovie(movieData);
        setRoomData(roomResponse);

        console.log("✅ Data loaded successfully");
        console.log(
          "🏢 Room:",
          roomResponse.roomName,
          "-",
          roomResponse.cinemaName
        );
        console.log("💺 Seats:", roomResponse.seats?.length || 0);
      } catch (error) {
        console.error("Fetch selection data error:", error);
        message.error("Không thể tải thông tin suất chiếu");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId, movieId, cinemaId, navigate]);

  const priceInfo = useMemo(() => {
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    return {
      totalPrice: total,
      seatCount: selectedSeats.length,
    };
  }, [selectedSeats]);

  const handleContinueToPayment = () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ghế để tiếp tục");
      return;
    }

    navigate("/confirm-payment", {
      state: {
        showtimeId,
        movieId,
        cinemaId,
        selectedSeats,
        priceInfo,
        movie,
        roomData,
      },
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p className="loading-text">Đang tải thông tin suất chiếu...</p>
      </div>
    );
  }

  if (!movie || !roomData) {
    return (
      <div className="error-container">
        <Empty
          description="Không thể tải thông tin suất chiếu"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="seat-selection-page">
      <div className="selection-container">
        <div className="selection-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined /> Quay lại
          </button>

          <div className="movie-info">
            <h1 className="movie-title">{movie?.title}</h1>
            <div className="movie-meta">
              <span className="cinema-name">{roomData?.cinemaName}</span>
              <span className="separator">•</span>
              <span className="room-name">{roomData?.roomName}</span>
            </div>
          </div>
        </div>

        <div className="selection-content">
          <div className="seat-section">
            <div className="section-header">
              <h2>Chọn ghế ngồi</h2>
              <p className="section-subtitle">
                Chọn tối đa 8 ghế trong một lần đặt
              </p>
            </div>

            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-icon available">
                  <i className="fa-solid fa-couch"></i>
                </div>
                <span>Ghế thường</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon available vip">
                  <i className="fa-solid fa-couch"></i>
                </div>
                <span>Ghế VIP</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon selected">
                  <i className="fa-solid fa-couch"></i>
                </div>
                <span>Đang chọn</span>
              </div>
              <div className="legend-item">
                <div className="legend-icon booked">
                  <i className="fa-solid fa-couch"></i>
                </div>
                <span>Đã đặt</span>
              </div>
            </div>

            <SeatMap
              showtimeId={showtimeId}
              selectedSeats={selectedSeats}
              onSeatSelect={setSelectedSeats}
            />
          </div>

          <div className="summary-section">
            <div className="summary-card">
              <h3>Thông tin đặt vé</h3>

              {movie?.poster && (
                <div className="summary-poster">
                  <img src={movie.poster} alt={movie.title} />
                </div>
              )}

              <div className="summary-details">
                <div className="detail-row">
                  <span className="label">Phim</span>
                  <span className="value">{movie?.title}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Rạp</span>
                  <span className="value">{roomData?.cinemaName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phòng</span>
                  <span className="value">{roomData?.roomName}</span>
                </div>
              </div>

              <div className="selected-seats-section">
                <div className="section-title">Ghế đã chọn</div>
                {selectedSeats.length > 0 ? (
                  <>
                    <div className="seats-list">
                      {selectedSeats.map((seat) => (
                        <div key={seat.seatId} className="seat-item">
                          <span className="seat-name">{seat.seatName}</span>
                          <span className="seat-price">
                            {new Intl.NumberFormat("vi-VN").format(seat.price)}đ
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="summary-total">
                      <span className="total-label">Tổng cộng</span>
                      <span className="total-amount">
                        {new Intl.NumberFormat("vi-VN").format(
                          priceInfo.totalPrice
                        )}
                        đ
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="empty-seats">Chưa chọn ghế nào</p>
                )}
              </div>

              <Button
                type="primary"
                size="large"
                block
                className="continue-button"
                onClick={handleContinueToPayment}
                disabled={selectedSeats.length === 0}
                icon={<ArrowRightOutlined />}
              >
                Tiếp tục thanh toán
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
