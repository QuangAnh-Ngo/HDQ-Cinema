// frontend/src/user/pages/ConfirmPayment/ConfirmPayment.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Spin, message, Card, Divider } from "antd";
import { bookingService, paymentService, authService } from "../../../services";
import Ticket from "../../components/Ticket/Ticket";
import "./ConfirmPayment.scss";

const ConfirmPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ SeatSelection truyền qua state
  const { showtimeId, selectedSeats, priceInfo, showtime, movie, roomInfo } =
    location.state || {};

  const [loading, setLoading] = useState(false);

  /**
   * Kiểm tra đăng nhập và dữ liệu đầu vào
   */
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning("Vui lòng đăng nhập để tiến hành thanh toán");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      message.error("Thông tin đặt vé không hợp lệ");
      navigate("/");
    }
  }, [navigate, selectedSeats, location.pathname]);

  /**
   * Quy trình xử lý thanh toán:
   * 1. Tạo đơn đặt vé (Booking)
   * 2. Tạo yêu cầu thanh toán (Payment)
   * 3. Chuyển hướng sang VNPAY
   */
  const handlePayment = async () => {
    setLoading(true);

    try {
      const user = authService.getCurrentUser();

      // 1. Tạo dữ liệu đơn hàng theo đúng Spec Backend
      const bookingData = {
        userId: user.id || user.memberId,
        showTimeId: showtimeId,
        cinemaId: roomInfo.cinemaId,
        seats: selectedSeats.map((seat) => seat.seatId),
      };

      // Gửi yêu cầu tạo booking
      const bookingResponse = await bookingService.create(bookingData);

      // Lấy bookingId từ kết quả trả về (thường nằm trong response.id hoặc response.result)
      const bookingId = bookingResponse.id || bookingResponse;

      message.loading("Đang khởi tạo giao dịch...", 1);

      // 2. Tạo yêu cầu thanh toán VNPAY
      const paymentResponse = await paymentService.create(bookingId);

      // 3. Chuyển hướng người dùng đến cổng thanh toán VNPay
      if (paymentResponse && paymentResponse.url) {
        window.location.href = paymentResponse.url;
      } else {
        throw new Error("Không thể khởi tạo liên kết thanh toán VNPay");
      }
    } catch (error) {
      console.error("Payment flow error:", error);
      message.error(
        error.response?.data?.message ||
          "Quá trình thanh toán thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!movie || !showtime || !roomInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="confirm-payment-page min-h-screen bg-gray-50 py-10 px-4">
      <div className="payment-container max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 justify-center items-start">
        {/* PHẦN THÔNG TIN HƯỚNG DẪN (BÊN TRÁI) */}
        <div className="flex-1 w-full">
          <Card className="instructions-card rounded-3xl shadow-sm border-none p-4">
            <h2 className="text-2xl font-black text-gray-800 uppercase mb-2">
              Xác nhận thanh toán
            </h2>
            <p className="text-gray-500 mb-8">
              Vui lòng kiểm tra kỹ các thông tin dưới đây trước khi thanh toán.
            </p>

            <div className="payment-info space-y-4">
              <h3 className="text-lg font-bold text-gray-700 border-l-4 border-blue-600 pl-3">
                Chi tiết giao dịch
              </h3>
              <ul className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Số lượng ghế:</span>
                  <strong className="text-gray-800">
                    {selectedSeats?.length || 0} ghế
                  </strong>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Phương thức thanh toán:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://vnpay.vn/s90/f90/2020/9/vnpay-qr.png"
                      alt="VNPay"
                      className="h-4"
                    />
                    <strong className="text-blue-600">VNPay</strong>
                  </div>
                </li>
                <Divider className="my-2" />
                <li className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Tổng số tiền:</span>
                  <strong className="total-price text-2xl text-red-600 font-black">
                    {(priceInfo?.totalPrice || 0).toLocaleString("vi-VN")} VNĐ
                  </strong>
                </li>
              </ul>
            </div>

            <div className="payment-note mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Lưu ý:</strong> Sau khi nhấn "Thanh toán", hệ thống sẽ
                chuyển bạn đến cổng VNPAY an toàn. Giao dịch cần được hoàn tất
                trong vòng <strong>10 phút</strong> để đảm bảo giữ chỗ thành
                công.
              </p>
            </div>

            <div className="action-buttons flex gap-4 mt-10">
              <Button
                size="large"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 h-14 rounded-xl font-bold border-gray-200"
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handlePayment}
                loading={loading}
                disabled={!selectedSeats || selectedSeats.length === 0}
                className="flex-[2] h-14 rounded-xl font-black uppercase tracking-widest bg-blue-600 border-none shadow-lg shadow-blue-100"
              >
                {loading ? "Đang xử lý..." : "Thanh toán qua VNPAY"}
              </Button>
            </div>
          </Card>
        </div>

        {/* PHẦN TÓM TẮT VÉ (BÊN PHẢI) */}
        <div className="w-full lg:w-[380px]">
          <Ticket
            movie={movie}
            showtime={showtime}
            roomInfo={roomInfo}
            selectedSeats={selectedSeats}
            priceInfo={priceInfo}
            onContinue={handlePayment}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmPayment;
