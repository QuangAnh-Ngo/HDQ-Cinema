import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Spin, message, Card, Divider } from "antd";
import { bookingService, paymentService, authService } from "../../../services";
import Ticket from "../../components/Ticket/Ticket";
import "./ConfirmPayment.scss";

const ConfirmPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    showtimeId,
    movieId,
    cinemaId,
    selectedSeats,
    priceInfo,
    movie,
    roomData,
  } = location.state || {};

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      message.warning("Vui lòng đăng nhập để tiến hành thanh toán");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (
      !showtimeId ||
      !selectedSeats ||
      selectedSeats.length === 0 ||
      !cinemaId
    ) {
      message.error("Thông tin đặt vé không hợp lệ");
      navigate("/");
      return;
    }
  }, [navigate, showtimeId, selectedSeats, cinemaId, location.pathname]);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const user = authService.getCurrentUser();
      console.log("👤 Current user:", user);

      const memberId =
        user.member_id ||
        user.memberId ||
        user.id ||
        user.userId ||
        user.username;

      if (!memberId) {
        message.error(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
        navigate("/login");
        return;
      }

      const bookingData = {
        memberId: memberId,
        showTimeId: showtimeId,
        cinemaId: cinemaId,
        seats: selectedSeats.map((seat) => seat.seatId),
      };

      console.log("📝 Creating booking with data:", bookingData);
      message.loading("Đang tạo đơn đặt vé...", 0);

      const bookingResponse = await bookingService.create(bookingData);
      console.log("✅ Booking created:", bookingResponse);

      const bookingId = bookingResponse?.id;

      if (!bookingId) {
        throw new Error("Không nhận được mã đặt vé từ server");
      }

      message.destroy();
      message.loading("Đang khởi tạo thanh toán...", 0);

      const paymentResponse = await paymentService.create(bookingId);
      console.log("✅ Payment response:", paymentResponse);

      message.destroy();

      const paymentUrl = paymentResponse?.url || paymentResponse?.result?.url;

      if (paymentUrl) {
        message.success("Chuyển hướng đến cổng thanh toán...", 1);
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 1000);
      } else {
        throw new Error("Không nhận được URL thanh toán từ VNPay");
      }
    } catch (error) {
      console.error("❌ Payment flow error:", error);
      message.destroy();

      if (error.needRealAuth || error.mockMode) {
        message.error({
          content: (
            <div style={{ whiteSpace: "pre-line" }}>
              <strong>⚠️ Thanh toán yêu cầu đăng nhập thật</strong>
              <br />
              <br />
              {error.message || "Backend chưa hỗ trợ mock payment"}
            </div>
          ),
          duration: 10,
        });
      } else {
        message.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể tạo đơn thanh toán. Vui lòng thử lại."
        );
      }

      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!movie || !roomData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const showtimeData = {
    showTime: roomData.showTime || new Date().toISOString(), // Fallback
  };

  return (
    <div className="confirm-payment-page min-h-screen bg-gray-50 py-10 px-4">
      <div className="payment-container max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 justify-center items-start">
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
                  <span className="text-gray-500">Ghế đã chọn:</span>
                  <strong className="text-purple-600">
                    {selectedSeats?.map((s) => s.seatName).join(", ")}
                  </strong>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Phương thức thanh toán:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png"
                      alt="VNPay"
                      className="h-6"
                    />
                    <strong className="text-blue-600">VNPay</strong>
                  </div>
                </li>
                <Divider className="my-2" />
                <li className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold">Tổng số tiền:</span>
                  <strong className="text-2xl text-red-600 font-black">
                    {new Intl.NumberFormat("vi-VN").format(
                      priceInfo?.totalPrice || 0
                    )}{" "}
                    VNĐ
                  </strong>
                </li>
              </ul>
            </div>

            <div className="payment-note mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>⚠️ Lưu ý:</strong> Sau khi nhấn "Thanh toán", hệ thống
                sẽ chuyển bạn đến cổng VNPAY. Giao dịch cần được hoàn tất trong
                vòng <strong>15 phút</strong> để đảm bảo giữ chỗ thành công.
              </p>
            </div>

            <div className="action-buttons flex gap-4 mt-10">
              <Button
                size="large"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 h-14 rounded-xl font-bold border-gray-200 hover:bg-gray-50"
              >
                Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handlePayment}
                loading={loading}
                disabled={!selectedSeats || selectedSeats.length === 0}
                className="flex-[2] h-14 rounded-xl font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 border-none shadow-lg"
              >
                {loading ? "Đang xử lý..." : "Thanh toán qua VNPAY"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="w-full lg:w-[380px]">
          <Ticket
            movie={movie}
            showtime={showtimeData}
            roomInfo={roomData}
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
