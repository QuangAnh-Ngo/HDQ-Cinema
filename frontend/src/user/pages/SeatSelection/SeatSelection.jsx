import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spin, message, Button, Modal } from "antd";
import {
  showtimeService,
  movieService,
  cinemaService,
} from "../../../services";
import SeatMap from "../../components/SeatMap/SeatMap";
import Ticket from "../../components/Ticket/Ticket";
import "./SeatSelection.scss";

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ state (truyền từ MovieDetail)
  const { cinemaId, city } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // State lưu trữ thông tin suất chiếu
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);

  /**
   * Tải thông tin suất chiếu, phim và phòng chiếu
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!showtimeId) return;
      setLoading(true);
      try {
        // 1. Lấy thông tin suất chiếu (id, showTime, roomId, movieId)
        const stData = await showtimeService.getById(showtimeId);
        setShowtime(stData);

        // 2. Lấy thông tin phim và rạp (để lấy danh sách phòng)
        const [movieData, cinemaData] = await Promise.all([
          movieService.getById(stData.movieId),
          cinemaService.getById(cinemaId),
        ]);

        setMovie(movieData);

        // 3. Tìm thông tin phòng chiếu cụ thể từ danh sách phòng của rạp
        const currentRoom = cinemaData.rooms?.find(
          (r) => r.roomId === stData.roomId
        );
        setRoomInfo({
          ...currentRoom,
          cinemaName: cinemaData.name,
          cinemaId: cinemaData.id,
        });
      } catch (error) {
        console.error("Fetch selection data error:", error);
        message.error("Không thể tải thông tin suất chiếu");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId, cinemaId, navigate]);

  /**
   * Tính toán tổng tiền dựa trên danh sách ghế đã chọn
   * Mỗi ghế từ SeatMap đã có sẵn trường 'price'
   */
  const priceInfo = useMemo(() => {
    const total = selectedSeats.reduce(
      (sum, seat) => sum + (seat.price || 0),
      0
    );
    return {
      totalPrice: total,
      seatCount: selectedSeats.length,
    };
  }, [selectedSeats]);

  /**
   * Chuyển sang bước xác nhận thanh toán
   */
  const handleContinueToPayment = () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một chỗ ngồi để tiếp tục");
      return;
    }

    // Chuyển sang trang ConfirmPayment với đầy đủ thông tin
    navigate(`/confirm-payment/new`, {
      state: {
        showtimeId,
        selectedSeats,
        priceInfo,
        movie,
        showtime,
        roomInfo, // Chứa cinemaName, roomName
      },
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f9f9f9]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="seat-selection-page max-w-7xl mx-auto px-4 py-8">
      {/* KHU VỰC CHỌN GHẾ (BÊN TRÁI) */}
      <div className="seat-container bg-white rounded-3xl p-8 shadow-sm">
        <h1 className="text-2xl font-black text-gray-800 uppercase mb-8">
          Chọn chỗ ngồi
        </h1>

        {/* Chú thích loại ghế */}
        <div className="seat-annotation mb-12 border-b border-gray-100 pb-8">
          <div className="seat-type">
            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
              <i className="fa-solid fa-couch text-xs text-gray-400"></i>
            </div>
            <span className="text-sm font-medium">Ghế thường</span>
          </div>
          <div className="seat-type">
            <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center">
              <i className="fa-solid fa-couch text-xs text-amber-500"></i>
            </div>
            <span className="text-sm font-medium">Ghế VIP</span>
          </div>
          <div className="seat-type">
            <div className="w-6 h-6 bg-[#8864f0] rounded flex items-center justify-center">
              <i className="fa-solid fa-couch text-xs text-white"></i>
            </div>
            <span className="text-sm font-medium">Đang chọn</span>
          </div>
          <div className="seat-type opacity-50">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
              <i className="fa-solid fa-couch text-xs text-white"></i>
            </div>
            <span className="text-sm font-medium">Đã bán</span>
          </div>
        </div>

        {/* Màn hình */}
        <div className="screen-wrapper mb-16">
          <div className="screen-line mx-auto mb-4"></div>
          <p className="text-[10px] uppercase tracking-[1em] text-gray-400">
            Màn hình chiếu
          </p>
        </div>

        {/* Sơ đồ ghế */}
        <SeatMap
          showtimeId={showtimeId}
          selectedSeats={selectedSeats}
          onSeatSelect={setSelectedSeats}
        />
      </div>

      {/* TÓM TẮT VÉ (BÊN PHẢI - COMPONENT TICKET) */}
      <div className="ticket-summary-panel w-full lg:w-[380px]">
        <Ticket
          movie={movie}
          showtime={showtime}
          roomInfo={roomInfo}
          selectedSeats={selectedSeats}
          priceInfo={priceInfo}
          onContinue={handleContinueToPayment}
        />
      </div>
    </div>
  );
};

export default SeatSelection;
