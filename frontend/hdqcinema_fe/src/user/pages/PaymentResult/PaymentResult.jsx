import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../services/api';
import './PaymentResult.scss';
// gửi lại backend vnp_ResponseCode, vnp_TxnRef để be cập nhật status, sau đó fe sẽ fetch status và hiện trang kết quả
const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [bookedSeats, setBookedSeats] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const responseCode = searchParams.get('vnp_ResponseCode');
        const bookingId = searchParams.get('vnp_TxnRef');

        const handleVerify = async () => {
            try {
                if (responseCode === '00' && bookingId) {
                    // Gọi backend để xác nhận thanh toán và cập nhật ghế HELD → BOOKED
                    const result = await verifyPayment(bookingId);

                    if (result.success) {
                        setBookedSeats(result.bookedSeats || []);
                        setStatus('success');
                    } else {
                        setStatus('failed');
                    }
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('failed');
            }
        };

        handleVerify();
    }, []);

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="payment-result-page">
        {status === 'loading' && (
            <div className="result-box loading">
            <h2>Đang xác nhận thanh toán...</h2>
            </div>
        )}

        {status === 'success' && (
            <div className="result-box success">
            <h2>Thanh toán thành công!</h2>
            <p>Cảm ơn bạn đã đặt vé. Thông tin vé đã được gửi đến tài khoản của bạn.</p>
            <button onClick={handleGoHome}>Về trang chủ</button>
            </div>
        )}

        {status === 'failed' && (
            <div className="result-box failed">
            <h2>Thanh toán thất bại hoặc bị hủy.</h2>
            <p>Bạn có thể thử lại thanh toán hoặc liên hệ hỗ trợ.</p>
            <button onClick={handleGoHome}>Về trang chủ</button>
            </div>
        )}
        </div>
    );
};

export default PaymentResult;
