import adminApi from "./adminApi";

export const getBookings = async (params = {}) => {
  try {
    const response = await adminApi.get("/bookings", { params });

    // Enrich booking data
    const bookings = await Promise.all(
      response.data.map(async (booking) => {
        try {
          const details = booking.booking_details || [];
          const firstDetail = details[0];

          if (!firstDetail) {
            return {
              id: booking.booking_id,
              code: booking.booking_id,
              totalAmount: booking.total_price,
              status: booking.booking_status.toLowerCase(),
              createdAt: booking.create_time,
              seats: [],
              paymentStatus: "pending",
            };
          }

          const showtime = await adminApi.get(
            `/show_times/${firstDetail.showtime_id}`
          );
          const [movie, room] = await Promise.all([
            adminApi.get(`/movies/${showtime.data.movie_id}`),
            adminApi.get(`/rooms/${showtime.data.room_id}`),
          ]);
          const cinema = await adminApi.get(`/cinemas/${room.data.cinema_id}`);

          const seats = await Promise.all(
            details.map((d) => adminApi.get(`/seats/${d.seat_id}`))
          );

          return {
            id: booking.booking_id,
            code: booking.booking_id,
            userName: "Customer",
            userEmail: "customer@example.com",
            movieTitle: movie.data.title,
            cinemaName: cinema.data.name,
            roomName: room.data.room_name,
            showDate: showtime.data.start_time.split("T")[0],
            showTime: showtime.data.start_time.split("T")[1].slice(0, 5),
            seats: seats.map((s) => `${s.data.seat_row}${s.data.seat_number}`),
            totalAmount: booking.total_price,
            status: booking.booking_status.toLowerCase(),
            paymentStatus:
              booking.booking_status === "CONFIRMED" ? "paid" : "pending",
            createdAt: booking.create_time,
          };
        } catch (err) {
          return {
            id: booking.booking_id,
            code: booking.booking_id,
            totalAmount: booking.total_price,
            status: booking.booking_status.toLowerCase(),
            createdAt: booking.create_time,
          };
        }
      })
    );

    return { bookings };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải danh sách đặt vé" };
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await adminApi.get(`/bookings/${id}`);
    const booking = response.data;

    // Get full detail like getBookings
    const details = booking.booking_details || [];
    if (details.length === 0) return booking;

    const firstDetail = details[0];
    const showtime = await adminApi.get(
      `/show_times/${firstDetail.showtime_id}`
    );
    const [movie, room] = await Promise.all([
      adminApi.get(`/movies/${showtime.data.movie_id}`),
      adminApi.get(`/rooms/${showtime.data.room_id}`),
    ]);
    const cinema = await adminApi.get(`/cinemas/${room.data.cinema_id}`);
    const seats = await Promise.all(
      details.map((d) => adminApi.get(`/seats/${d.seat_id}`))
    );

    return {
      id: booking.booking_id,
      code: booking.booking_id,
      userName: "Customer",
      userEmail: "customer@example.com",
      userPhone: "0901234567",
      movieTitle: movie.data.title,
      cinemaName: cinema.data.name,
      roomName: room.data.room_name,
      showDate: showtime.data.start_time.split("T")[0],
      showTime: showtime.data.start_time.split("T")[1].slice(0, 5),
      seats: seats.map((s) => `${s.data.seat_row}${s.data.seat_number}`),
      ticketPrice: details[0].price,
      totalAmount: booking.total_price,
      discount: 0,
      paymentMethod: "Online",
      paymentStatus:
        booking.booking_status === "CONFIRMED" ? "paid" : "pending",
      status: booking.booking_status.toLowerCase(),
      createdAt: booking.create_time,
    };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thông tin đặt vé" };
  }
};

export const cancelBooking = async (id, reason = "") => {
  try {
    const response = await adminApi.patch(`/bookings/${id}`, {
      booking_status: "CANCELLED",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi hủy đặt vé" };
  }
};

export const confirmPayment = async (id) => {
  try {
    const response = await adminApi.patch(`/bookings/${id}`, {
      booking_status: "CONFIRMED",
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi xác nhận thanh toán" };
  }
};

export const getBookingStats = async (params = {}) => {
  try {
    const response = await adminApi.get("/bookings");
    const bookings = response.data;

    const today = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter((b) =>
      b.create_time.startsWith(today)
    );

    return {
      totalBookings: bookings.length,
      todayRevenue: todayBookings.reduce((sum, b) => sum + b.total_price, 0),
    };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thống kê" };
  }
};
