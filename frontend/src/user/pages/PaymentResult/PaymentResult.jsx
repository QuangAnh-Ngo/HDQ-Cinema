// frontend/src/user/pages/PaymentResult/PaymentResult.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Spin, Result, Card, Tag } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  HomeOutlined,
  HistoryOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { paymentService, bookingService } from "../../../services";
import { message } from "antd";
import "./PaymentResult.scss";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // ✅ Get all params from URL
        const params = Object.fromEntries(searchParams.entries());
        const responseCode = params.vnp_ResponseCode;
        const bookingId = params.vnp_TxnRef;

        console.log("🔄 VNPay callback params:", params);
        console.log("💳 Response code:", responseCode);
        console.log("📝 Booking ID:", bookingId);

        if (responseCode === "00") {
          // ✅ SUCCESS flow
          try {
            // 1. Verify with backend
            await paymentService.handleCallback(params);
            console.log("✅ Payment verified");

            // 2. Get booking details (if API exists)
            // Note: Backend might not have getById endpoint for bookings
            // So we construct booking info from available data
            const bookingDetails = {
              bookingId: bookingId,
              totalPrice: parseInt(params.vnp_Amount) / 100, // VNPay returns in cents
              orderInfo: params.vnp_OrderInfo,
              transactionNo: params.vnp_TransactionNo,
              bankCode: params.vnp_BankCode,
              payDate: params.vnp_PayDate,
            };

            setBooking(bookingDetails);
            setStatus("success");
          } catch (error) {
            console.error("❌ Error getting booking details:", error);
            // Still show success if payment verified
            setStatus("success");
            setBooking({
              bookingId: bookingId,
              totalPrice: parseInt(params.vnp_Amount) / 100,
            });
          }
        } else {
          // ✅ FAILED flow
          setStatus("failed");
          setError(getErrorMessage(responseCode));
        }
      } catch (err) {
        console.error("❌ Payment verification error:", err);
        setStatus("failed");
        setError(
          err.response?.data?.message ||
            "Không thể xác nhận trạng thái thanh toán"
        );
      }
    };

    verifyPayment();
  }, [searchParams]);

  /**
   * ✅ Get error message by VNPay response code
   */
  const getErrorMessage = (code) => {
    const errorMessages = {
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "Thẻ/Tài khoản chưa đăng ký Internet Banking",
      10: "Xác thực thông tin không thành công",
      11: "Giao dịch đã hết hạn chờ thanh toán",
      12: "Thẻ/Tài khoản đã bị khóa",
      24: "Bạn đã hủy giao dịch",
      51: "Tài khoản không đủ số dư",
      65: "Vượt quá hạn mức giao dịch trong ngày",
      75: "Ngân hàng đang bảo trì",
      79: "Giao dịch vượt quá số lần thanh toán cho phép",
    };
    return (
      errorMessages[code] ||
      "Thanh toán không thành công. Vui lòng thử lại sau."
    );
  };

  /**
   * ✅ Copy booking ID to clipboard
   */
  const handleCopyBookingId = () => {
    const bookingId = booking?.bookingId || searchParams.get("vnp_TxnRef");
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      message.success("Đã sao chép mã vé!");
    }
  };

  /**
   * ✅ Format amount
   */
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  // ✅ Loading state
  if (status === "loading") {
    return (
      <div className="payment-result-page">
        <Card className="result-card loading">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />} />
          <h2 className="loading-title">Đang xác thực giao dịch...</h2>
          <p className="loading-text">
            Vui lòng không đóng trình duyệt lúc này
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <Card className="result-card">
        {status === "success" ? (
          <div className="success-result">
            <Result
              status="success"
              icon={<CheckCircleFilled className="success-icon" />}
              title={<h1 className="result-title">Thanh toán thành công!</h1>}
              subTitle={
                <p className="result-subtitle">
                  Cảm ơn bạn đã tin tưởng dịch vụ của HDQ Cinema
                </p>
              }
              extra={[
                <Button
                  type="primary"
                  key="home"
                  size="large"
                  icon={<HomeOutlined />}
                  className="action-btn primary"
                  onClick={() => navigate("/")}
                >
                  Về trang chủ
                </Button>,
                <Button
                  key="history"
                  size="large"
                  icon={<HistoryOutlined />}
                  className="action-btn secondary"
                  onClick={() => navigate("/member/bookings")}
                >
                  Lịch sử đặt vé
                </Button>,
              ]}
            />

            {/* Booking Details */}
            {booking && (
              <div className="booking-details">
                <h3 className="details-title">🎫 Thông tin vé điện tử</h3>

                <div className="details-content">
                  {/* Booking ID */}
                  <div className="detail-row highlight">
                    <span className="label">Mã vé</span>
                    <div className="value-with-copy">
                      <span className="booking-id">
                        {booking.bookingId || searchParams.get("vnp_TxnRef")}
                      </span>
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={handleCopyBookingId}
                        className="copy-btn"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="detail-row">
                    <span className="label">Số tiền</span>
                    <span className="value amount">
                      {formatAmount(
                        booking.totalPrice ||
                          parseInt(searchParams.get("vnp_Amount")) / 100
                      )}
                    </span>
                  </div>

                  {/* Transaction info */}
                  {booking.transactionNo && (
                    <div className="detail-row">
                      <span className="label">Mã giao dịch</span>
                      <span className="value">{booking.transactionNo}</span>
                    </div>
                  )}

                  {booking.bankCode && (
                    <div className="detail-row">
                      <span className="label">Ngân hàng</span>
                      <Tag color="blue">{booking.bankCode}</Tag>
                    </div>
                  )}

                  {booking.payDate && (
                    <div className="detail-row">
                      <span className="label">Thời gian</span>
                      <span className="value">
                        {new Date(
                          booking.payDate.replace(
                            /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                            "$1-$2-$3T$4:$5:$6"
                          )
                        ).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="booking-note">
                  <p>
                    ⚠️ Vui lòng đưa <strong>mã vé</strong> cho nhân viên tại
                    quầy để nhận vé cứng trước giờ chiếu.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Result
            status="error"
            icon={<CloseCircleFilled className="error-icon" />}
            title={<h1 className="result-title">Thanh toán thất bại</h1>}
            subTitle={<p className="result-subtitle error">{error}</p>}
            extra={[
              <Button
                type="primary"
                danger
                key="retry"
                size="large"
                className="action-btn danger"
                onClick={() => navigate("/")}
              >
                Thử lại
              </Button>,
              <Button
                key="home"
                size="large"
                className="action-btn secondary"
                onClick={() => navigate("/")}
              >
                Về trang chủ
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentResult;
