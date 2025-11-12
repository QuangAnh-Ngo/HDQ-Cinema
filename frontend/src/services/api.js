const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const login = async (username, password) => {
    const response = await fetch(`${BASE_URL}/cinemas/auth/token`, {
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

    return data.result;
};

// Logout function
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Check if user is logged in
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Get current user
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const getCinemas = async () => {
    const response = await fetch(`${BASE_URL}/cinemas`);
    if (!response.ok) throw new Error('Failed to fetch cinemas');
    const data = await response.json();
    const cinemas = data.result || data;
    if (!Array.isArray(cinemas)) throw new Error('Invalid cinemas data');
    return cinemas;
};

export const getCinemaById = async (cinemaId) => {
    const response = await fetch(`${BASE_URL}/cinemas/${cinemaId}`);
    if (!response.ok) throw new Error('Failed to fetch cinema details');
    const data = await response.json();
    return data.result || data;
};

export const getMovies = async () => {
    const response = await fetch(`${BASE_URL}/movies`);
    if (!response.ok) throw new Error('Failed to fetch movies');
    const data = await response.json();
    const movies = data.result || data;
    if (!Array.isArray(movies)) throw new Error('Invalid movies data');
    return movies;
};

export const getMovieById = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movies/${movieId}`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    const data = await response.json();
    return data.result || data;
};

export const getShowtimes = async (movieId) => {
    // Option 1: Nếu backend có endpoint lấy showtimes theo movieId
    const response = await fetch(`${BASE_URL}/movies/${movieId}/showtimes`);
    // Option 2: Nếu backend chỉ có endpoint lấy tất cả rồi filter ở frontend
    // const response = await fetch(`${BASE_URL}/showtimes`);
    if (!response.ok) throw new Error('Failed to fetch showtimes');
    const data = await response.json();
    const showtimes = data.result || data;
    return Array.isArray(showtimes) ? showtimes : [];
};

// Nếu cần lấy showtimes theo cả movieId và cinemaId
export const getShowtimesByCinema = async (movieId, cinemaId) => {
    const response = await fetch(
        `${BASE_URL}/cinemas/${cinemaId}/movies/${movieId}/showtimes`
    );
    if (!response.ok) throw new Error('Failed to fetch showtimes');
    const data = await response.json();
    return data.result || data;
};

export const getRoomsByCinema = async (cinemaId) => {
    const response = await fetch(`${BASE_URL}/cinemas/${cinemaId}/rooms`);
    if (!response.ok) throw new Error("Failed to fetch rooms");
    const data = await response.json();
    const rooms = data.result || data;
    return Array.isArray(rooms) ? rooms : [];
};

export const getRoomById = async (roomId) => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    const data = await response.json();
    return data.result || data;
};

export const getSeatById = async (seatId) => {
    const response = await fetch(`${BASE_URL}/seats/${seatId}`);
    if (!response.ok) throw new Error('Failed to fetch seat details');
    const data = await response.json();
    return data.result || data;
};

export const getSeatsByRoom = async (roomId) => {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/seats`);
    if (!response.ok) throw new Error("Failed to fetch seats");
    const data = await response.json();
    const seats = data.result || data;
    return Array.isArray(seats) ? seats : [];
};

export const getSeatStatus = async (showtimeId, seatId) => {
    // Backend nên có endpoint riêng để check seat status
    const response = await fetch(
        `${BASE_URL}/showtimes/${showtimeId}/seats/${seatId}/status`
    );
    if (!response.ok) throw new Error('Failed to fetch seat status');
    const data = await response.json();
    // Nếu backend trả về { status: "AVAILABLE" }
    return data.status || data.result?.status || 'AVAILABLE';
};

export const getTicketPrice = async (showtimeId, seatType) => {
    // Backend cần implement endpoint này
    const response = await fetch(
        `${BASE_URL}/showtimes/${showtimeId}/price?seatType=${seatType}`
    );
    if (!response.ok) throw new Error('Failed to fetch ticket price');
    const data = await response.json();
    return data.result || data;
};

export const createBooking = async (bookingData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Thêm Authorization header nếu cần
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
    }
    const data = await response.json();
    return data.result || data;
};

export const getBookingById = async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });
    if (!response.ok) throw new Error('Failed to fetch booking');
    const data = await response.json();
    return data.result || data;
};

export const holdSeats = async ({ showtimeId, seatIds }) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/seats/hold`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({ showtimeId, seatIds })
        });
        if (!response.ok) throw new Error('Failed to hold seats');
        const data = await response.json();
        return data.result || data;
    } catch (err) {
        console.error('Error holding seats:', err);
        throw err;
    }
};

export const createPayment = async (bookingId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ bookingId }),
    });
    if (!response.ok) throw new Error('Failed to create payment');
    const data = await response.json();
    return data.result || data;
};

export const verifyPayment = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${BASE_URL}/bookings/${bookingId}/confirm-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({ bookingId }),
        });
        if (!response.ok) throw new Error('Xác nhận thanh toán thất bại');
        const data = await response.json();
        return data.result || data;
    } catch (err) {
        console.error('Error verifying payment:', err);
        throw err;
    }
};


// ==================== HELPER: Fetch với token tự động ====================
export const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    });

    // Nếu token hết hạn (401), có thể redirect về login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
    }

    return response;
};