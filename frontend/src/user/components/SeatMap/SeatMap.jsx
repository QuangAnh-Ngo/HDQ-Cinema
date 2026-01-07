import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Spin, message } from "antd";
import { seatService } from "../../../services";
import "./SeatMap.scss";

const MAX_SEAT_SELECTION = 8;

const SeatMap = ({ showtimeId, selectedSeats = [], onSeatSelect }) => {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeats = async () => {
      if (!showtimeId) return;

      setLoading(true);
      try {
        const data = await seatService.getSeatsByShowtime(showtimeId);
        console.log("🎬 Raw room data:", data);
        console.log("💺 Total seats from API:", data?.seats?.length);

        if (data?.seats) {
          const uniqueSeatsMap = new Map();
          data.seats.forEach((seat) => {
            if (!uniqueSeatsMap.has(seat.seatId)) {
              uniqueSeatsMap.set(seat.seatId, seat);
            }
          });

          const uniqueSeats = Array.from(uniqueSeatsMap.values());

          console.log("✅ Unique seats after dedup:", uniqueSeats.length);

          if (data.seats.length !== uniqueSeats.length) {
            console.warn(
              `⚠️ Removed ${
                data.seats.length - uniqueSeats.length
              } duplicate seats`
            );
          }

          data.seats = uniqueSeats;
        }

        setRoomData(data);
      } catch (error) {
        console.error("Error fetching seats:", error);
        message.error("Không thể tải sơ đồ ghế");
        setRoomData(null);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [showtimeId]);

  const seatRows = useMemo(() => {
    if (!roomData?.seats) return {};

    const rows = seatService.groupByRow(roomData.seats);

    Object.keys(rows).forEach((rowLabel) => {
      rows[rowLabel] = seatService.sortSeatsInRow(rows[rowLabel]);
    });

    return rows;
  }, [roomData]);

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
    classes.push(seat.seatStatus.toLowerCase());
    classes.push(seat.seatType.toLowerCase());

    if (selectedSeats.some((s) => s.seatId === seat.seatId)) {
      classes.push("selected");
    }

    return classes.join(" ");
  };

  if (loading) {
    return (
      <div className="seat-map loading">
        <Spin size="large" />
        <p className="text-gray-400 mt-4">Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  if (!roomData || !roomData.seats || roomData.seats.length === 0) {
    return (
      <div className="seat-map empty">
        <p className="text-gray-500">
          Không có thông tin ghế cho suất chiếu này
        </p>
      </div>
    );
  }

  return (
    <div className="seat-map">
      <div className="screen-wrapper">
        <div className="screen-line" />
        <p className="screen-label">Màn hình</p>
      </div>

      <div className="map">
        {Object.entries(seatRows)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([rowLabel, rowSeats]) => (
            <div key={`row-${rowLabel}`} className="row">
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

      {selectedSeats.length > 0 && (
        <div className="selection-summary">
          <p className="summary-label">
            Ghế đã chọn ({selectedSeats.length}/{MAX_SEAT_SELECTION}):
          </p>
          <p className="selected-list">
            {selectedSeats.map((s) => s.seatName).join(", ")}
          </p>
          <p className="summary-total">
            Tổng tiền:{" "}
            <span className="total-price">
              {new Intl.NumberFormat("vi-VN").format(
                selectedSeats.reduce((sum, s) => sum + s.price, 0)
              )}
              đ
            </span>
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
