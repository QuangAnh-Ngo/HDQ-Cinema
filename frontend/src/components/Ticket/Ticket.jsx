import { useState, useEffect } from 'react';
import { Card, Button } from 'antd';
import { getMovieById, getRoomById } from '../../services/api';
import './Ticket.scss';

const Ticket = ({ movieId, date, time, roomId, selectedSeats, onContinue }) => {
    const [movie, setMovie] = useState(null);
    const [room, setRoom] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieData = await getMovieById(movieId);
                const roomData = await getRoomById(roomId);
                setMovie(movieData);
                setRoom(roomData);
            } catch (error) {
                console.error('Error fetching movie or room details:', error);
            }
        };
        fetchData();
    }, [movieId, roomId]);

    if (!movie || !room) {
        return (
            <Card className="ticket-container loading">
                <p>Đang tải dữ liệu vé...</p>
            </Card>
        );
    }


    return (
        <Card className="ticket-container">
            <div className="ticket-detail">
                <div className="movie-detail">
                    <div className="movie-poster">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                        />
                    </div>
                    <h3>{movie.title}</h3>
                    <ul>
                        <li><span><i class="fa-solid fa-tags" /> Thể loại:</span> <strong>{movie.genre || movie.genre.join(', ')}</strong></li>
                        <li><span><i class="fa-regular fa-clock" /> Thời lượng:</span> <strong>{movie.duration} phút</strong></li>
                    </ul>
                </div>

                <hr />

                <div className="seat-location">
                    <ul>
                        <li><span><i class="fa-solid fa-building" /> Rạp chiếu:</span> <strong>HDQ Cinema: </strong></li>
                        <li><span><i class="fa-regular fa-calendar" /> Ngày chiếu:</span> <strong>{date}</strong></li>
                        <li><span><i class="fa-regular fa-clock" /> Giờ chiếu:</span> <strong>{time}</strong></li>
                        <li><span><i class="fa-solid fa-tv" /> Phòng chiếu:</span> <strong>{room.room_name}</strong></li>
                        <li><span><i class="fa-solid fa-cubes" /> Ghế ngồi:</span> <strong>{selectedSeats.map(s => `${s.seat_row}${s.seat_number}`).join(', ')}</strong></li>
                    </ul>
                </div>

                <div className="button-container">
                    <Button
                        type="primary"
                        id="openPayment"
                        onClick={onContinue}
                        disabled={!selectedSeats.length}
                    >
                        Tiếp tục
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default Ticket;