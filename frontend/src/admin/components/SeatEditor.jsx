import { useState, useEffect } from "react";
import { FiX, FiSave, FiRotateCcw } from "react-icons/fi";
import "../styles/SeatEditor.scss";

const SeatEditor = ({ room, onClose, onSave }) => {
  const [seats, setSeats] = useState([]);
  const [selectedType, setSelectedType] = useState("standard");
  const [hasChanges, setHasChanges] = useState(false);

  const seatTypes = [
    { id: "standard", label: "Ghế thường", color: "#3b82f6", price: 45000 },
    { id: "vip", label: "Ghế VIP", color: "#f59e0b", price: 75000 },
    { id: "couple", label: "Ghế đôi", color: "#ec4899", price: 150000 },
    { id: "empty", label: "Lối đi", color: "transparent", price: 0 },
  ];

  useEffect(() => {
    if (room?.seats && room.seats.length > 0) {
      setSeats(room.seats);
    } else {
      generateSeats();
    }
  }, [room]);

  const generateSeats = () => {
    const rows = room?.rows || 10;
    const seatsPerRow = room?.seatsPerRow || 12;
    const newSeats = [];

    for (let row = 0; row < rows; row++) {
      const rowLetter = String.fromCharCode(65 + row);
      for (let col = 0; col < seatsPerRow; col++) {
        newSeats.push({
          id: `${rowLetter}${col + 1}`,
          row: rowLetter,
          number: col + 1,
          type: "standard",
          status: "available",
        });
      }
    }

    setSeats(newSeats);
  };

  const handleSeatClick = (seatId) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === seatId ? { ...seat, type: selectedType } : seat
      )
    );
    setHasChanges(true);
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại sơ đồ ghế?")) {
      generateSeats();
      setHasChanges(true);
    }
  };

  const handleSave = () => {
    const seatData = {
      roomId: room.id,
      seats: seats,
      totalSeats: seats.filter((s) => s.type !== "empty").length,
      layout: {
        rows: room.rows,
        seatsPerRow: room.seatsPerRow,
      },
    };
    onSave(seatData);
  };

  const getSeatStyle = (type) => {
    const seatType = seatTypes.find((t) => t.id === type);
    return {
      backgroundColor: seatType?.color || "#e5e7eb",
      cursor: "pointer",
    };
  };

  const getSeatsPerRow = () => {
    const grouped = {};
    seats.forEach((seat) => {
      if (!grouped[seat.row]) grouped[seat.row] = [];
      grouped[seat.row].push(seat);
    });
    return grouped;
  };

  const getSummary = () => {
    const summary = {};
    seatTypes.forEach((type) => {
      if (type.id !== "empty") {
        summary[type.id] = {
          count: seats.filter((s) => s.type === type.id).length,
          label: type.label,
          price: type.price,
        };
      }
    });
    return summary;
  };

  const seatsGrouped = getSeatsPerRow();
  const summary = getSummary();

  return (
    <div className="modal-overlay seat-editor-modal">
      <div className="modal full-screen">
        <div className="modal-header">
          <div>
            <h2>Chỉnh sửa sơ đồ ghế - {room?.name}</h2>
            <p className="subtitle">Click vào ghế để thay đổi loại ghế</p>
          </div>
          <button onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="seat-editor-content">
          {/* Toolbar */}
          <div className="seat-toolbar">
            <div className="seat-types">
              {seatTypes.map((type) => (
                <button
                  key={type.id}
                  className={`seat-type-btn ${
                    selectedType === type.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedType(type.id)}
                  style={{
                    borderColor: type.color,
                    backgroundColor:
                      selectedType === type.id ? type.color : "white",
                    color: selectedType === type.id ? "white" : "#374151",
                  }}
                >
                  <span
                    className="color-indicator"
                    style={{ backgroundColor: type.color }}
                  />
                  {type.label}
                  {type.price > 0 && (
                    <span className="price">
                      {type.price.toLocaleString()}đ
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="toolbar-actions">
              <button onClick={handleReset} className="btn secondary">
                <FiRotateCcw size={18} />
                Đặt lại
              </button>
              <button
                onClick={handleSave}
                className="btn primary"
                disabled={!hasChanges}
              >
                <FiSave size={18} />
                Lưu sơ đồ
              </button>
            </div>
          </div>

          {/* Seat Layout */}
          <div className="seat-layout-container">
            <div className="screen">
              <div className="screen-label">Màn hình</div>
            </div>

            <div className="seat-grid">
              {Object.keys(seatsGrouped)
                .sort()
                .map((rowKey) => (
                  <div key={rowKey} className="seat-row">
                    <div className="row-label">{rowKey}</div>
                    <div className="seats">
                      {seatsGrouped[rowKey].map((seat) => (
                        <div
                          key={seat.id}
                          className={`seat ${seat.type}`}
                          style={getSeatStyle(seat.type)}
                          onClick={() => handleSeatClick(seat.id)}
                          title={`${seat.id} - ${
                            seatTypes.find((t) => t.id === seat.type)?.label
                          }`}
                        >
                          {seat.type !== "empty" && (
                            <span className="seat-number">{seat.number}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Summary */}
          <div className="seat-summary">
            <h3>Thống kê ghế</h3>
            <div className="summary-grid">
              {Object.entries(summary).map(([key, data]) => (
                <div key={key} className="summary-item">
                  <span className="label">{data.label}:</span>
                  <span className="value">
                    {data.count} ghế ({data.price.toLocaleString()}đ)
                  </span>
                </div>
              ))}
              <div className="summary-item total">
                <span className="label">Tổng cộng:</span>
                <span className="value">
                  {seats.filter((s) => s.type !== "empty").length} ghế
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatEditor;
