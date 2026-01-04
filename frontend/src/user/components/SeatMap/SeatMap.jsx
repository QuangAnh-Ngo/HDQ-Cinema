import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Spin, message } from "antd";
import { seatService } from "../../../services";
import "./SeatMap.scss";

const MAX_SEAT_SELECTION = 8;

const SeatMap = ({ showtimeId, selectedSeats = [], onSeatSelect }) => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch seats từ Backend dựa trên showtimeId
   * API: GET /rooms?showtimeld={showtimeId}
   */
  useEffect(() => {
    const loadSeats = async () => {
      if (!showtimeId) return;

      setLoading(true);
      try {
        // Gọi service đã sửa đổi để lấy dữ liệu từ room-controller
        const seatData = await seatService.getSeatsByShowtime(showtimeId);
        setSeats(seatData);
      } catch (error) {
        console.error("Error fetching seats:", error);
        message.error("Không thể tải sơ đồ ghế");
        setSeats([]);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [showtimeId]);

  /**
   * Nhóm ghế theo hàng dựa trên ký tự đầu của seatName (VD: "A" từ "A1")
   */
  const seatRows = useMemo(() => {
    const rows = {};

    seats.forEach((seat) => {
      // Backend trả về seatName là "A1", "A2"...
      const rowLabel = seat.seatName.charAt(0);
      if (!rows[rowLabel]) {
        rows[rowLabel] = [];
      }
      rows[rowLabel].push(seat);
    });

    // Sắp xếp ghế trong mỗi hàng theo số thứ tự (số sau ký tự hàng)
    Object.keys(rows).forEach((rowLabel) => {
      rows[rowLabel].sort((a, b) => {
        const numA = parseInt(a.seatName.substring(1)) || 0;
        const numB = parseInt(b.seatName.substring(1)) || 0;
        return numA - numB;
      });
    });

    return rows;
  }, [seats]);

  const handleSeatClick = (seat) => {
    if (seat.seatStatus !== "AVAILABLE") {
      message.warning("Ghế này đã có người đặt hoặc đang được giữ");
      return;
    }

    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (!isSelected) {
      if (selectedSeats.length >= MAX_SEAT_SELECTION) {
        message.warning(`Bạn chỉ được chọn tối đa ${MAX_SEAT_SELECTION} ghế`);
        return;
      }
      onSeatSelect([...selectedSeats, seat]);
    } else {
      onSeatSelect(selectedSeats.filter((s) => s.seatId !== seat.seatId));
    }
  };

  const getSeatClass = (seat) => {
    const classes = ["seat"];

    // Status: available, booked, held (Lowercase để khớp SCSS)
    classes.push(seat.seatStatus.toLowerCase());

    // Type: classic, vip (Lowercase để khớp SCSS)
    classes.push(seat.seatType.toLowerCase());

    if (selectedSeats.some((s) => s.seatId === seat.seatId)) {
      classes.push("selected");
    }

    return classes.join(" ");
  };

  if (loading) {
    return (
      <div className="seat-map loading py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="seat-map empty py-20">
        <p className="text-gray-500">
          Không có thông tin ghế cho suất chiếu này
        </p>
      </div>
    );
  }

  return (
    <div className="seat-map">
      {/* Màn hình chiếu - Giữ nguyên style cũ của bạn thông qua JSX bổ trợ */}
      <div className="w-full mb-12">
        <div className="h-1 w-3/4 bg-gray-400 mx-auto rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-[1em] text-center">
          Màn hình
        </p>
      </div>

      <div className="map">
        {Object.entries(seatRows).map(([rowLabel, rowSeats]) => (
          <div key={rowLabel} className="row">
            <div className="row-label">{rowLabel}</div>
            <div className="row-seats">
              {rowSeats.map((seat) => (
                <div
                  key={seat.seatId}
                  className={getSeatClass(seat)}
                  onClick={() => handleSeatClick(seat)}
                  title={`${seat.seatName} - ${
                    seat.seatType
                  } - ${new Intl.NumberFormat("vi-VN").format(seat.price)}đ`}
                >
                  <i className="fa-solid fa-couch"></i>
                  <span className="seat-label">{seat.seatName}</span>
                </div>
              ))}
            </div>
            <div className="row-label">{rowLabel}</div>
          </div>
        ))}
      </div>

      {/* Selection Summary - Giữ nguyên logic hiển thị của bạn */}
      {selectedSeats.length > 0 && (
        <div className="selection-summary mt-10 p-4 bg-white/5 rounded-xl border border-white/10 w-full max-w-md">
          <p className="text-gray-400 text-sm">
            Ghế đã chọn ({selectedSeats.length}/{MAX_SEAT_SELECTION}):
          </p>
          <p className="selected-list text-[#8864f0] font-black text-lg">
            {selectedSeats.map((s) => s.seatName).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};

SeatMap.propTypes = {
  showtimeId: PropTypes.string.isRequired,
  selectedSeats: PropTypes.array,
  onSeatSelect: PropTypes.func.isRequired,
};

export default SeatMap;
