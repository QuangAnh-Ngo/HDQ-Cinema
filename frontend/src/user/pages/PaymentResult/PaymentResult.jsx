// frontend/src/user/pages/PaymentResult/PaymentResult.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Spin, Result, Descriptions, Card, Divider } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  HomeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { paymentService, bookingService } from "../../../services";
import "./PaymentResult.scss";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  /**
   * Quy trình:
   * 1. Lấy tất cả params từ URL do VNPay trả về
   * 2. Gửi về backend để xác thực (Verify Checksum)
   * 3. Nếu thành công, lấy chi tiết booking để hiển thị
   */
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const responseCode = params.vnp_ResponseCode;
        const bookingId = params.vnp_TxnRef; // vnp_TxnRef thường là mã đơn hàng/bookingId

        if (responseCode === "00") {
          // Bước 1: Xác thực giao dịch với Backend
          await paymentService.handleCallback(params);

          // Bước 2: Lấy thông tin chi tiết đơn vé vừa đặt thành công
          // Lưu ý: Sử dụng API checkBookingStatus hoặc getById tùy backend của bạn
          const bookingDetails = await bookingService.getById(bookingId);

          setBooking(bookingDetails);
          setStatus("success");
        } else {
          setStatus("failed");
          setError(getErrorMessage(responseCode));
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setStatus("failed");
        setError(
          err.response?.data?.message ||
            "Không thể xác nhận trạng thái thanh toán"
        );
      }
    };

    verifyPayment();
  }, [searchParams]);

  const getErrorMessage = (code) => {
    const errorMessages = {
      "07": "Giao dịch bị nghi ngờ gian lận.",
      "09": "Thẻ/Tài khoản chưa đăng ký Internet Banking.",
      10: "Xác thực thông tin khách hàng không thành công.",
      11: "Giao dịch đã hết hạn chờ thanh toán.",
      12: "Thẻ/Tài khoản đã bị khóa.",
      24: "Bạn đã hủy giao dịch thanh toán.",
      51: "Tài khoản không đủ số dư.",
      65: "Giao dịch vượt quá hạn mức trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
    };
    return (
      errorMessages[code] || "Thanh toán không thành công, vui lòng thử lại."
    );
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="payment-result-page">
        <div className="result-card loading">
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 64, color: "#8864f0" }}
                spin
              />
            }
          />
          <h2 className="mt-8 text-2xl font-bold">
            Đang xác thực giao dịch...
          </h2>
          <p className="text-gray-400">
            Vui lòng không đóng trình duyệt lúc này
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <Card className="result-card shadow-2xl">
        {status === "success" ? (
          <Result
            status="success"
            icon={<CheckCircleFilled className="text-green-500" />}
            title={
              <h1 className="text-white text-3xl font-black uppercase">
                Thanh toán thành công!
              </h1>
            }
            subTitle={
              <p className="text-gray-400">
                Cảm ơn bạn đã tin tưởng dịch vụ của HDQ Cinema.
              </p>
            }
            extra={[
              <Button
                type="primary"
                key="home"
                icon={<HomeOutlined />}
                className="btn-home h-12 px-8 rounded-xl font-bold"
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>,
              <Button
                key="history"
                icon={<HistoryOutlined />}
                className="btn-history h-12 px-8 rounded-xl font-bold bg-white/10 text-white border-none"
                onClick={() => navigate("/members/my-info")}
              >
                Lịch sử đặt vé
              </Button>,
            ]}
          >
            {booking && (
              <div className="booking-summary-ticket mt-8 text-left bg-[#1a1528] rounded-2xl p-6 border border-dashed border-gray-600">
                <h3 className="text-center font-bold text-blue-400 uppercase tracking-widest mb-4">
                  Thông tin vé điện tử
                </h3>
                <Descriptions
                  column={1}
                  size="small"
                  bordered={false}
                  className="custom-descriptions"
                >
                  <Descriptions.Item label="Mã vé">
                    <span className="font-mono text-yellow-500 font-bold uppercase">
                      {booking.bookingId || searchParams.get("vnp_TxnRef")}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phim">
                    <span className="text-white font-bold">
                      {booking.movieTitle}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Suất chiếu">
                    <span className="text-white">
                      {booking.showTime} -{" "}
                      {new Date(booking.showDate).toLocaleDateString("vi-VN")}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghế">
                    <span className="text-purple-400 font-bold">
                      {booking.seats?.join(", ")}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    <span className="text-red-500 font-black">
                      {new Intl.NumberFormat("vi-VN").format(
                        searchParams.get("vnp_Amount") / 100
                      )}{" "}
                      VNĐ
                    </span>
                  </Descriptions.Item>
                </Descriptions>
                <Divider className="border-gray-700 my-4" />
                <p className="text-[10px] text-gray-500 italic text-center italic">
                  * Vui lòng đưa mã này cho nhân viên tại quầy để nhận vé cứng.
                </p>
              </div>
            )}
          </Result>
        ) : (
          <Result
            status="error"
            icon={<CloseCircleFilled className="text-red-500" />}
            title={
              <h1 className="text-white text-3xl font-black uppercase">
                Thanh toán thất bại
              </h1>
            }
            subTitle={<p className="text-gray-400">{error}</p>}
            extra={[
              <Button
                type="primary"
                danger
                key="retry"
                className="h-12 px-8 rounded-xl font-bold"
                onClick={() => navigate(-1)}
              >
                Thử lại
              </Button>,
              <Button
                key="home"
                className="h-12 px-8 rounded-xl font-bold bg-white/10 text-white border-none"
                onClick={() => navigate("/")}
              >
                Quay lại trang chủ
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentResult;
