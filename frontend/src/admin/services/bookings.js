// frontend/src/admin/services/bookings.js
import axiosInstance from "../../services/axiosInstance";
import { API_ENDPOINTS } from "../../config/api";

/**
 * Get all bookings
 */
export const getBookings = async (params = {}) => {
  try {
    // Backend endpoint: GET /bookings
    const bookings = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
      params,
    });

    // Enrich bookings with related data
    const enrichedBookings = await enrichBookingsWithDetails(
      Array.isArray(bookings) ? bookings : []
    );

    return { bookings: enrichedBookings };
  } catch (error) {
    console.error("Get bookings error:", error);
    throw error;
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id) => {
  try {
    // Backend endpoint: GET /bookings/{bookingId}
    const booking = await axiosInstance.get(API_ENDPOINTS.BOOKING_BY_ID(id));

    // Enrich with details
    const enriched = await enrichBookingWithDetails(booking);
    return enriched;
  } catch (error) {
    console.error("Get booking error:", error);
    throw error;
  }
};

/**
 * Create booking (Admin side - nếu cần tạo booking thủ công)
 */
export const createBooking = async (bookingData) => {
  try {
    // Backend endpoint: POST /bookings
    // Body theo BookingRequest
    const payload = {
      memberId: bookingData.memberId,
      paymentUrlId: bookingData.paymentUrlId,
      bookingDetailRequests: bookingData.seats.map((seatId) => ({
        seatId: seatId,
        showtimeId: bookingData.showtimeId,
      })),
    };

    const booking = await axiosInstance.post(API_ENDPOINTS.BOOKINGS, payload);
    return booking;
  } catch (error) {
    console.error("Create booking error:", error);
    throw error;
  }
};

/**
 * Update booking (nếu backend support)
 */
export const updateBooking = async (id, bookingData) => {
  try {
    // Backend có thể chỉ cho phép update status
    const payload = {
      bookingStatus: bookingData.status || bookingData.bookingStatus,
    };

    const booking = await axiosInstance.put(
      API_ENDPOINTS.BOOKING_BY_ID(id),
      payload
    );
    return booking;
  } catch (error) {
    console.error("Update booking error:", error);
    throw error;
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (id, reason = "") => {
  try {
    // Backend endpoint: PUT /bookings/{bookingId}
    // Change status to CANCELLED
    const booking = await axiosInstance.put(API_ENDPOINTS.BOOKING_BY_ID(id), {
      bookingStatus: "CANCELLED",
      cancellationReason: reason,
    });
    return booking;
  } catch (error) {
    console.error("Cancel booking error:", error);
    throw error;
  }
};

/**
 * Confirm payment for booking
 */
export const confirmPayment = async (id) => {
  try {
    // Backend endpoint: PUT /bookings/{bookingId}
    // Change status to CONFIRMED
    const booking = await axiosInstance.put(API_ENDPOINTS.BOOKING_BY_ID(id), {
      bookingStatus: "CONFIRMED",
    });
    return booking;
  } catch (error) {
    console.error("Confirm payment error:", error);
    throw error;
  }
};

/**
 * Delete booking (nếu backend support)
 */
export const deleteBooking = async (id) => {
  try {
    // Backend endpoint: DELETE /bookings/{bookingId}
    await axiosInstance.delete(API_ENDPOINTS.BOOKING_BY_ID(id));
  } catch (error) {
    console.error("Delete booking error:", error);
    throw error;
  }
};

/**
 * Get booking stats
 */
export const getBookingStats = async (params = {}) => {
  try {
    const bookings = await axiosInstance.get(API_ENDPOINTS.BOOKINGS, {
      params,
    });

    const today = new Date().toISOString().split("T")[0];
    const todayBookings = bookings.filter(
      (b) => b.bookingDate?.startsWith(today) || b.createdAt?.startsWith(today)
    );

    const confirmedBookings = bookings.filter(
      (b) => b.bookingStatus === "CONFIRMED"
    );

    const todayRevenue = todayBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );

    return {
      totalBookings: bookings.length,
      todayBookings: todayBookings.length,
      confirmedBookings: confirmedBookings.length,
      todayRevenue,
    };
  } catch (error) {
    console.error("Get booking stats error:", error);
    return {
      totalBookings: 0,
      todayBookings: 0,
      confirmedBookings: 0,
      todayRevenue: 0,
    };
  }
};

/**
 * Get amount of pending bookings
 */
export const getPendingBookingsAmount = async () => {
  try {
    // Backend endpoint: GET /bookings/amount-of-pending-bookings
    const result = await axiosInstance.get(
      API_ENDPOINTS.BOOKINGS_PENDING_AMOUNT
    );
    return result;
  } catch (error) {
    console.error("Get pending bookings amount error:", error);
    return { amount: 0 };
  }
};

/**
 * Helper: Enrich multiple bookings with details
 */
const enrichBookingsWithDetails = async (bookings) => {
  if (!bookings || bookings.length === 0) return [];

  try {
    // Fetch all related data
    const [moviesRes, showtimesRes, roomsRes, cinemasRes, membersRes] =
      await Promise.all([
        axiosInstance.get(API_ENDPOINTS.MOVIES),
        axiosInstance.get(API_ENDPOINTS.SHOWTIMES),
        axiosInstance.get(API_ENDPOINTS.ROOMS),
        axiosInstance.get(API_ENDPOINTS.CINEMAS),
        axiosInstance.get(API_ENDPOINTS.MEMBERS),
      ]);

    const movies = Array.isArray(moviesRes) ? moviesRes : [];
    const showtimes = Array.isArray(showtimesRes) ? showtimesRes : [];
    const rooms = Array.isArray(roomsRes) ? roomsRes : [];
    const cinemas = Array.isArray(cinemasRes) ? cinemasRes : [];
    const members = Array.isArray(membersRes) ? membersRes : [];

    return bookings.map((booking) => {
      // Get showtime từ bookingDetails
      const firstDetail = booking.bookingDetails?.[0];
      const showtime = showtimes.find(
        (st) => st.showtimeId === firstDetail?.showtimeId
      );

      const movie = movies.find((m) => m.movieId === showtime?.movieId);
      const room = rooms.find((r) => r.roomId === showtime?.roomId);
      const cinema = cinemas.find((c) => c.cinemaId === room?.cinemaId);
      const member = members.find((m) => m.memberId === booking.memberId);

      // Extract seat info từ bookingDetails
      const seatIds = booking.bookingDetails?.map((bd) => bd.seatId) || [];

      return {
        id: booking.bookingId,
        bookingId: booking.bookingId,
        code: booking.bookingId,
        userName: member?.name || "N/A",
        userEmail: member?.email || "N/A",
        userPhone: member?.phoneNumber || "N/A",
        movieTitle: movie?.title || "N/A",
        cinemaName: cinema?.name || "N/A",
        roomName: room?.name || "N/A",
        showDate: showtime?.startTime?.split("T")[0] || "N/A",
        showTime: showtime?.startTime?.split("T")[1]?.substring(0, 5) || "N/A",
        seats: seatIds,
        totalAmount: booking.totalPrice || 0,
        status: (booking.bookingStatus || "PENDING").toLowerCase(),
        paymentStatus:
          booking.bookingStatus === "CONFIRMED" ? "paid" : "pending",
        createdAt: booking.bookingDate || booking.createdAt,
        bookingDetails: booking.bookingDetails,
      };
    });
  } catch (error) {
    console.error("Enrich bookings error:", error);
    return bookings; // Return original if enrichment fails
  }
};

/**
 * Helper: Enrich single booking with details
 */
const enrichBookingWithDetails = async (booking) => {
  if (!booking) return null;

  try {
    const firstDetail = booking.bookingDetails?.[0];
    if (!firstDetail) return booking;

    // Fetch related data
    const showtime = await axiosInstance.get(
      API_ENDPOINTS.SHOWTIME_BY_ID(firstDetail.showtimeId)
    );

    const [movie, room, member] = await Promise.all([
      axiosInstance.get(API_ENDPOINTS.MOVIE_BY_ID(showtime.movieId)),
      axiosInstance.get(API_ENDPOINTS.ROOM_BY_ID(showtime.roomId)),
      axiosInstance.get(API_ENDPOINTS.MEMBER_BY_ID(booking.memberId)),
    ]);

    const cinema = await axiosInstance.get(
      API_ENDPOINTS.CINEMA_BY_ID(room.cinemaId)
    );

    const seatIds = booking.bookingDetails.map((bd) => bd.seatId);

    return {
      id: booking.bookingId,
      bookingId: booking.bookingId,
      code: booking.bookingId,
      userName: member.name,
      userEmail: member.email,
      userPhone: member.phoneNumber,
      movieTitle: movie.title,
      cinemaName: cinema.name,
      roomName: room.name,
      showDate: showtime.startTime.split("T")[0],
      showTime: showtime.startTime.split("T")[1].substring(0, 5),
      seats: seatIds,
      totalAmount: booking.totalPrice,
      status: (booking.bookingStatus || "PENDING").toLowerCase(),
      paymentStatus: booking.bookingStatus === "CONFIRMED" ? "paid" : "pending",
      createdAt: booking.bookingDate,
      bookingDetails: booking.bookingDetails,
    };
  } catch (error) {
    console.error("Enrich booking error:", error);
    return booking;
  }
};
