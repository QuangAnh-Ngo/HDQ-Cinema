import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getSeatsByRoom, getSeatStatus } from '../../services/api';
import './SeatMap.scss';

const MAX_SEAT_SELECTION = 5;

const SeatMap = ({ showtimeId, roomId, onSelect }) => {
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        const loadSeats = async () => {
        try {
            const seatData = await getSeatsByRoom(roomId);
            const seatsWithStatus = await Promise.all(
            seatData.map(async (seat) => {
                const status = await getSeatStatus(showtimeId, seat.seat_id);
                return { ...seat, seat_status: status };
            })
            );
            setSeats(seatsWithStatus);
        } catch (err) {
            console.error('Error fetching seats:', err);
        }    
        };
        if (roomId && showtimeId) loadSeats();
    }, [roomId, showtimeId]);

    const handleSelectSeat = (seat) => {
        if (seat.seat_status !== 'AVAILABLE') return;

        const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id);

        if (!isSelected && selectedSeats.length >= MAX_SEAT_SELECTION) {
            alert(`Bạn chỉ được chọn tối đa ${MAX_SEAT_SELECTION} ghế`);
            return; 
        }

        const updated = isSelected
            ? selectedSeats.filter(s => s.seat_id !== seat.seat_id)
            : [...selectedSeats, seat];

        setSelectedSeats(updated);
        onSelect(updated);
    };

    const rows = seats.reduce((acc, seat) => {
        acc[seat.seat_row] = acc[seat.seat_row] || [];
        acc[seat.seat_row].push(seat);
        return acc;
    }, {});

    Object.keys(rows).forEach(row => {
        rows[row].sort((a, b) => a.seat_number - b.seat_number);
    });

    return (
        <div className="seat-map">
            <div className="map">
                {Object.entries(rows).map(([rowLabel, rowSeats]) => (
                    <div key={rowLabel} className="row">
                        {rowSeats.map((seat) => (
                            <div
                                key={seat.seat_id}
                                className={`seat 
                                    ${seat.seat_status.toLowerCase()} 
                                    ${seat.seat_type.toLowerCase()} 
                                    ${selectedSeats.some(s => s.seat_id === seat.seat_id) ? 'selected' : ''}`
                                }
                                onClick={() => handleSelectSeat(seat)}
                            >
                                <i className="fa-solid fa-couch"></i>
                                {seat.seat_row}
                                {seat.seat_number}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

SeatMap.propTypes = {
  showtimeId: PropTypes.string,
  roomId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default SeatMap;

