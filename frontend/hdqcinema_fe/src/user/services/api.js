const BASE_URL = "http://localhost:5000";

// ==========================================
// AUTHENTICATION
// ==========================================

export const login = async (username, password) => {
  try {
    // Fake login for development - Check with members table
    const response = await fetch(`${BASE_URL}/members?username=${username}`);

    if (!response.ok) {
      throw new Error("Đăng nhập thất bại");
    }

    const users = await response.json();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    // Fake token for development
    const token = `fake-token-${user.id}-${Date.now()}`;

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        email: user.email,
        role: user.role || "user",
      })
    );

    return {
      result: {
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          email: user.email,
          role: user.role || "user",
        },
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    // Get all existing members to generate new ID
    const response = await fetch(`${BASE_URL}/members`);
    const members = await response.json();

    const newId = Math.max(...members.map((m) => m.id), 0) + 1;
    const memberId = `MB${String(newId).padStart(3, "0")}`;

    const newMember = {
      id: newId,
      member_id: memberId,
      username: userData.username,
      name: userData.name || userData.username,
      password: userData.password,
      email: userData.email,
      phone: userData.phone || "",
      phone_number: userData.phone || "",
      dob: userData.dob || "",
      role: "user",
      avatar: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createResponse = await fetch(`${BASE_URL}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMember),
    });

    if (!createResponse.ok) {
      throw new Error("Đăng ký thất bại");
    }

    return await createResponse.json();
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

// ==========================================
// CINEMAS
// ==========================================

export const getCinemas = async () => {
  try {
    const response = await fetch(`${BASE_URL}/cinemas`);
    if (!response.ok) throw new Error("Failed to fetch cinemas");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get cinemas error:", error);
    throw error;
  }
};

export const getCinemaById = async (cinemaId) => {
  try {
    const response = await fetch(`${BASE_URL}/cinemas?cinema_id=${cinemaId}`);
    if (!response.ok) throw new Error("Failed to fetch cinema details");
    const data = await response.json();
    // If array, return first item
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }

    return data;
  } catch (error) {
    console.error("Get cinema error:", error);
    throw error;
  }
};

// ==========================================
// MOVIES
// ==========================================

export const getMovies = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const url = query ? `${BASE_URL}/movies?${query}` : `${BASE_URL}/movies`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch movies");

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get movies error:", error);
    throw error;
  }
};

export const getMovieById = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movies?movie_id=${movieId}`);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    return data;
  } catch (error) {
    console.error("Get movie error:", error);
    throw error;
  }
};

// ==========================================
// SHOWTIMES
// ==========================================

export const getShowtimes = async (movieId) => {
  const response = await fetch(`${BASE_URL}/showtimes`);
  if (!response.ok) throw new Error("Failed to fetch showtimes");
  const showtimes = await response.json();
  const matches = showtimes.filter((d) => d.movie_id === movieId);
  return matches;
};

export const getShowtimeById = async (showtimeId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/showtimes?showtime_id=${showtimeId}`
    );
    if (!response.ok) throw new Error("Failed to fetch showtime");
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    return data;
  } catch (error) {
    console.error("Get showtime error:", error);
    throw error;
  }
};

// ==========================================
// ROOMS
// ==========================================

export const getRoomsByCinema = async (cinemaId) => {
  try {
    // Support both numeric id and cinema_id string
    const response = await fetch(`${BASE_URL}/rooms?cinemaId=${cinemaId}`);

    if (!response.ok) {
      // Try with cinema_id
      const altResponse = await fetch(
        `${BASE_URL}/rooms?cinema_id=CIN${String(cinemaId).padStart(3, "0")}`
      );
      if (!altResponse.ok) throw new Error("Failed to fetch rooms");
      const data = await altResponse.json();
      return Array.isArray(data) ? data : [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get rooms error:", error);
    return [];
  }
};

export const getRoomById = async (roomId) => {
  try {
    const response = await fetch(`${BASE_URL}/rooms?room_id=${roomId}`);
    if (!response.ok) throw new Error("Failed to fetch room");
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }

    return data;
  } catch (error) {
    console.error("Get room error:", error);
    throw error;
  }
};

// ==========================================
// SEATS
// ==========================================

export const getSeatsByRoom = async (roomId) => {
  try {
    // First, get the room to access nested seats
    const room = await getRoomById(roomId);

    if (!room) return [];

    // Return seats from room object
    if (room.seats && Array.isArray(room.seats)) {
      return room.seats;
    }

    // Fallback: try separate seats table
    const response = await fetch(`${BASE_URL}/seats?room_id=${roomId}`);
    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Get seats error:", error);
    return [];
  }
};

export const getSeatById = async (seatId) => {
  try {
    const response = await fetch(`${BASE_URL}/seats?seat_id=${seatId}`);
    if (!response.ok) throw new Error("Failed to fetch seat details");

    const data = await response.json();

    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }

    return data;
  } catch (error) {
    console.error("Get seat error:", error);
    throw error;
  }
};

export const getSeatStatus = async (showtimeId, seatId) => {
  try {
    const response = await fetch(`${BASE_URL}/bookings`);
    if (!response.ok) return "AVAILABLE";

    const bookings = await response.json();

    for (const booking of bookings) {
      // Check if booking is for this showtime
      if (
        booking.showtimeId === showtimeId ||
        booking.showtime_id === showtimeId
      ) {
        // Check if seat is in this booking
        if (booking.seats && Array.isArray(booking.seats)) {
          if (booking.seats.includes(seatId)) {
            return booking.status === "confirmed" ? "BOOKED" : "HELD";
          }
        }
      }

      // Check booking_details if exists
      if (Array.isArray(booking.booking_details)) {
        const match = booking.booking_details.find(
          (d) =>
            (d.showtime_id === showtimeId || d.showtimeId === showtimeId) &&
            (d.seat_id === seatId || d.seatId === seatId)
        );
        if (match) return match.seat_status || "BOOKED";
      }
    }

    return "AVAILABLE";
  } catch (error) {
    console.error("Get seat status error:", error);
    return "AVAILABLE";
  }
};

// ==========================================
// BOOKINGS
// ==========================================

export const createBooking = async (bookingData) => {
  try {
    // Get all bookings to generate new ID
    const response = await fetch(`${BASE_URL}/bookings`);
    const bookings = await response.json();

    const newId = Math.max(...bookings.map((b) => b.id || 0), 0) + 1;
    const bookingId = `B${String(newId).padStart(3, "0")}`;
    const code = `BK${String(newId).padStart(3, "0")}`;

    // Get user from localStorage
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    // Get showtime details
    const showtime = await getShowtimeById(bookingData.showtimeId);
    const movie = showtime ? await getMovieById(showtime.movieId) : null;
    const cinema = showtime ? await getCinemaById(showtime.cinemaId) : null;
    const room = showtime ? await getRoomById(showtime.roomId) : null;

    const newBooking = {
      id: newId,
      booking_id: bookingId,
      code: code,
      userId: user?.id || 1,
      user_id: user?.member_id || "MB001",
      userName: user?.name || user?.username || "Guest",
      userEmail: user?.email || "",
      userPhone: user?.phone || "",
      showtimeId: bookingData.showtimeId,
      showtime_id: showtime?.showtime_id,
      movieId: showtime?.movieId,
      movie_id: showtime?.movie_id,
      movieTitle: movie?.title || "",
      cinemaId: showtime?.cinemaId,
      cinema_id: showtime?.cinema_id,
      cinemaName: cinema?.name || "",
      roomId: showtime?.roomId,
      room_id: showtime?.room_id,
      roomName: room?.name || room?.room_name || "",
      showDate: showtime?.date || "",
      showTime: showtime?.startTime || "",
      seats: bookingData.seats || [],
      ticketPrice: bookingData.ticketPrice || 45000,
      totalAmount: bookingData.totalAmount || 0,
      total_price: bookingData.totalAmount || 0,
      discount: bookingData.discount || 0,
      paymentMethod: bookingData.paymentMethod || "Cash",
      paymentStatus: "pending",
      status: "pending",
      booking_status: "PENDING",
      createdAt: new Date().toISOString(),
      create_time: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createResponse = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    });

    if (!createResponse.ok) throw new Error("Failed to create booking");

    return await createResponse.json();
  } catch (error) {
    console.error("Create booking error:", error);
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/bookings?booking_id=${bookingId}`
    );
    if (!response.ok) throw new Error("Failed to fetch booking");
    const data = await response.json();
    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }
    return data;
  } catch (error) {
    console.error("Get booking error:", error);
    throw error;
  }
};

// ==========================================
// PAYMENTS
// ==========================================

export const createPayment = async (bookingId) => {
  try {
    // Mock payment creation
    return {
      success: true,
      paymentUrl: `/confirm-payment?bookingId=${bookingId}`,
      bookingId,
    };
  } catch (error) {
    console.error("Create payment error:", error);
    throw error;
  }
};

export const verifyPayment = async (bookingId) => {
  try {
    // Update booking status to confirmed
    const booking = await getBookingById(bookingId);

    if (!booking) throw new Error("Booking not found");

    const updateResponse = await fetch(`${BASE_URL}/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus: "paid",
        status: "confirmed",
        booking_status: "CONFIRMED",
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!updateResponse.ok) throw new Error("Failed to verify payment");

    return await updateResponse.json();
  } catch (error) {
    console.error("Verify payment error:", error);
    throw error;
  }
};

export const holdSeats = async ({ showtimeId, seatIds }) => {
  try {
    // Mock hold seats - in real app, this would call backend
    console.log("Holding seats:", { showtimeId, seatIds });
    return {
      success: true,
      message: "Seats held successfully",
      expiresIn: 300, // 5 minutes
    };
  } catch (error) {
    console.error("Hold seats error:", error);
    throw error;
  }
};

// ==========================================
// TICKET PRICE
// ==========================================

export const getTicketPrice = async (seatType, dayType, cinemaId) => {
  try {
    const response = await fetch(`${BASE_URL}/ticket_price`);
    if (!response.ok) return 45000; // Default price

    const prices = await response.json();

    // Find matching price
    const match = prices.find(
      (p) =>
        (p.seat_type === seatType || p.seatType === seatType) &&
        (p.day_type === dayType || p.dayType === dayType) &&
        (p.cinema_id === cinemaId || p.cinemaId === cinemaId)
    );

    return match?.price || 45000;
  } catch (error) {
    console.error("Get ticket price error:", error);
    return 45000; // Default price
  }
};
