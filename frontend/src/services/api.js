const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const login = async (username, password) => {
    const response = await fetch(`http://localhost:8080/cinemas/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại');
    }

    const data = await response.json();

    const token = data.result?.token;
    const user = data.result?.user;

    if (token) {
        localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
    }

    return data;
};

export const getCinemas = async () => {
    const response = await fetch(`${BASE_URL}/cinemas`);
    if (!response.ok) throw new Error('Failed to fetch cinemas');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid cinemas data');
    return data;
};

export const getCinemaById = async (cinemaId) => {
    const response = await fetch(`${BASE_URL}/cinemas?cinema_id=${cinemaId}`);
    if (!response.ok) throw new Error('Failed to fetch cinema details');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Cinema not found');
    return data[0];
};

export const getMovies = async () => {
    const response = await fetch(`${BASE_URL}/movies`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid movies data');
    return data;
};

export const getMovieById = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movies?movie_id=${movieId}`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Movie not found');
    return data[0];
};

export const getShowtimes = async (movieId) => {
    const response = await fetch(`${BASE_URL}/show_times`);
    if (!response.ok) throw new Error('Failed to fetch showtimes');
    const showtimes = await response.json();
    const matches = showtimes.filter(
        (d) => d.movie_id === movieId
    );
    return matches;
};

// export const getShowtimes = async (movieId, cinemaId) => {
//   const response = await fetch(`${BASE_URL}/cinemas/movies/upcoming?c=${cinemaId}`);
//   if (!response.ok) throw new Error('Failed to fetch showtimes');
//   const data = await response.json();
//   const movies = data.result || [];
//   const movie = movies.find((m) => m.id === movieId);
//   return movie?.showtimes || [];
// };


export const getRoomsByCinema = async (cinemaId) => {
    const response = await fetch(`${BASE_URL}/rooms?cinema_id=${cinemaId}`);
    if (!response.ok) throw new Error("Failed to fetch rooms");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export const getRoomById = async (roomId) => {
    const response = await fetch(`${BASE_URL}/rooms?room_id=${roomId}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Room not found');
    return data[0];
};


export const getSeatById = async (seatId) => {
    const response = await fetch(`${BASE_URL}/seats?seat_id=${seatId}`);
    if (!response.ok) throw new Error('Failed to fetch seat details');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Seat not found');
    return data[0];
};

export const getSeatsByRoom = async (roomId) => {
    const response = await fetch(`${BASE_URL}/seats?room_id=${roomId}`);
    if (!response.ok) throw new Error("Failed to fetch seats");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

export const getSeatStatus = async (showtimeId, seatId) => {
    const response = await fetch(`${BASE_URL}/bookings`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    const bookings = await response.json();

    for (const booking of bookings) {
        if (Array.isArray(booking.booking_details)) {
            const match = booking.booking_details.find(
                (d) => d.showtime_id === showtimeId && d.seat_id === seatId
            );
            if (match) return match.seat_status;
        }
    }
    return 'AVAILABLE';
};

export const getTicketPrice = async () => {

}

export const createBooking = async (bookingData) => {
    const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
    });

    if (!response.ok) throw new Error('Failed to create booking');
    return await response.json();
};

export const getBookingById = async (bookingId) => {
    const response = await fetch(`${BASE_URL}/bookings?booking_id=${bookingId}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Booking not found');
    return data[0];
};

export const createPayment = async (bookingId) => {
    const response = await fetch(`${BASE_URL}/payments/create_payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
    });
    if (!response.ok) throw new Error('Failed to create payment');
    return await response.json();
};

export const holdSeats = async ({ showtimeId, seatIds }) => {
    try {
        const response = await fetch('/api/seats/hold', { // fetch cho BE chỉnh seat_status
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ showtimeId, seatIds })
        });
        if (!response.ok) throw new Error('Failed to hold seats');
        return await response.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}; // thêm userId

export const verifyPayment = async (bookingId) => {
    try {
        const res = await fetch('/api/bookings/confirmPayment', { // fetch do BE cung cấp đọc từ bookingId
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
        });

        if (!res.ok) throw new Error('Xác nhận thanh toán thất bại');

        return res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
};