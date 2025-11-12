import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createBooking, holdSeats, createPayment } from '../../services/api';
import Ticket from '../../components/Ticket/Ticket';
import './ConfirmPayment.scss';

const ConfirmPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movieId, date, time, roomId, showtimeId, selectedSeats, totalPrice } = location.state || {};
    //gửi thêm cả cinema_id cho backend
    const handlePayment = async () => {
        try {
            if (!selectedSeats || selectedSeats.length === 0) {
                alert('Chưa có ghế nào được chọn');
                return;
            }

            await holdSeats({
                showtimeId,
                seatIds: selectedSeats.map((s) => (s.seat_id ? s.seat_id : s))
            }); // thêm userID

            const bookingPayload = {
                movieId,
                date,
                time,
                roomId,
                showtimeId,
                seats: selectedSeats.map((s) => (s.seat_id ? s.seat_id : s)),
                totalPrice,
            };

            const bookingResponse = await createBooking(bookingPayload);
            const { bookingId } = bookingResponse;

            if (!bookingId) {
                alert('Không nhận được bookingId từ máy chủ.');
                return;
            }

            const paymentResponse = await createPayment(bookingId);
            const { paymentUrl } = paymentResponse;

            if (!paymentUrl) {
                alert('Không nhận được liên kết thanh toán từ máy chủ.');
                return;
            }

            localStorage.setItem('bookingId', bookingId);

            window.location.href = paymentUrl;

        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
        }
    };


    return (
        <div className="confirm-payment-page">
            <div className="bill-container">
                {/* thông tin hóa đơn */}
            </div>

            <Ticket
                movieId={movieId}
                date={date}
                time={time}
                roomId={roomId}
                selectedSeats={selectedSeats}
                onContinue={handlePayment}
            />
        </div>
    );
};

export default ConfirmPayment;