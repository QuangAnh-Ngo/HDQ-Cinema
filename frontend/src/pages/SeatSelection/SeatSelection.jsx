import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SeatMap from '../../components/SeatMap/SeatMap';
import Ticket from '../../components/Ticket/Ticket';
import './SeatSelection.scss';

const SeatSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movieId, date, time, roomId, showtimeId } = location.state || {};

    const [selectedSeats, setSelectedSeats] = useState([]);

    const handleContinueToPayment = () => {
        if (selectedSeats.length) {
            navigate('/confirm-payment', {
                state: {
                    movieId,
                    date,
                    time,
                    roomId,
                    showtimeId,
                    selectedSeats,
                },
            });
        } else {
            alert('Chọn ghế trước khi tiếp tục');
        }
    };

    return (
        <div className="seat-selection-page">
            <div className="seat-container">
                <div className="seat-annotation">
                    <div className="seat-type" id="available-seat">
                        <i className="fa-solid fa-couch"></i>Ghế trống
                    </div>
                    <div className="seat-type" id="vip-seat">
                        <i className="fa-solid fa-couch"></i>Ghế VIP
                    </div>
                    <div className="seat-type" id="selected-seat">
                        <i className="fa-solid fa-couch"></i>Ghế đang chọn
                    </div>
                    <div className="seat-type" id="held-seat">
                        <i className="fa-solid fa-couch"></i>Ghế đang được giữ
                    </div>
                    <div className="seat-type" id="booked-seat">
                        <i className="fa-solid fa-couch"></i>Ghế đã bán
                    </div>
                </div>
                <h2>MÀN HÌNH CHIẾU</h2>
                <SeatMap
                    key={`${showtimeId}-${roomId}`}
                    showtimeId={showtimeId}
                    roomId={roomId}
                    onSelect={setSelectedSeats}
                />
            </div>

            <Ticket
                movieId={movieId}
                date={date}
                time={time}
                roomId={roomId}
                selectedSeats={selectedSeats}
                onContinue={handleContinueToPayment}
            />
        </div>
    );
};

export default SeatSelection;