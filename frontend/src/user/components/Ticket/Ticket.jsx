import { Card, Button, Spin } from "antd";
import PropTypes from "prop-types";
import "./Ticket.scss";

const Ticket = ({
  movie,
  showtime,
  roomInfo,
  selectedSeats,
  priceInfo,
  onContinue,
}) => {
  // Trạng thái Loading khi chưa có đủ dữ liệu
  if (!movie || !showtime || !roomInfo) {
    return (
      <Card className="ticket-container flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </Card>
    );
  }

  /**
   * Định dạng thời gian: showTime từ Backend (ISO String)
   */
  const dateObj = new Date(showtime.showTime);
  const formattedDate = dateObj.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  /**
   * Định dạng danh sách ghế đã chọn (Dùng seatName từ Backend)
   */
  const seatNames = selectedSeats.map((seat) => seat.seatName).join(", ");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  return (
    <Card className="ticket-container shadow-xl border-none">
      <div className="ticket-detail">
        {/* Phim & Poster */}
        <div className="movie-detail">
          <div className="movie-poster overflow-hidden rounded-xl shadow-lg">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-poster.jpg";
              }}
            />
          </div>
          <h3 className="text-gray-800 uppercase tracking-wide">
            {movie.title}
          </h3>
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
              T{movie.limitAge}
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {movie.duration} phút
            </span>
          </div>
        </div>

        <hr className="dashed-line" />

        {/* Thông tin suất chiếu */}
        <div className="seat-location">
          <ul>
            <li>
              <span>
                <i className="fa-solid fa-building mr-2 text-blue-500" /> Rạp:
              </span>
              <strong>{roomInfo.cinemaName}</strong>
            </li>
            <li>
              <span>
                <i className="fa-regular fa-calendar mr-2 text-blue-500" />{" "}
                Ngày:
              </span>
              <strong>{formattedDate}</strong>
            </li>
            <li>
              <span>
                <i className="fa-regular fa-clock mr-2 text-blue-500" /> Giờ
                chiếu:
              </span>
              <strong className="text-blue-600">{formattedTime}</strong>
            </li>
            <li>
              <span>
                <i className="fa-solid fa-display mr-2 text-blue-500" /> Phòng:
              </span>
              <strong>{roomInfo.roomName}</strong>
            </li>
            <li>
              <span>
                <i className="fa-solid fa-chair mr-2 text-blue-500" /> Ghế:
              </span>
              <strong className="text-purple-600">
                {seatNames || "Chưa chọn"}
              </strong>
            </li>
          </ul>
        </div>

        <hr className="dashed-line" />

        {/* Tổng tiền */}
        <div className="price-summary p-4 bg-gray-50 rounded-2xl mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Tạm tính:</span>
            <strong className="text-xl text-red-600 font-black">
              {formatCurrency(priceInfo?.totalPrice || 0)}
            </strong>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="button-container">
          <Button
            type="primary"
            size="large"
            block
            className="h-14 rounded-xl font-bold uppercase tracking-widest bg-[#8864f0] hover:bg-[#7a56e0] border-none shadow-lg"
            onClick={onContinue}
            disabled={!selectedSeats || selectedSeats.length === 0}
          >
            {selectedSeats.length > 0
              ? `Thanh toán (${selectedSeats.length} ghế)`
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
