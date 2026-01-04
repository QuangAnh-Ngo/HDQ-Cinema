// frontend/src/admin/services/showtimes.js
// Wrapper - Re-export from main service
import {
  showtimeService,
  movieService,
  cinemaService,
  roomService,
} from "../../services";

/**
 * Get all showtimes
 */
export const getShowtimes = async (params = {}) => {
  try {
    // Backend endpoint: GET /showtimes
    // Có thể filter: ?movieId=1&cinemaId=2&date=2024-01-01
    const showtimes = await axiosInstance.get(API_ENDPOINTS.SHOWTIMES, {
      params,
    });

    // Enrich với movie, cinema, room names
    const enrichedShowtimes = await enrichShowtimesWithNames(
      Array.isArray(showtimes) ? showtimes : []
    );

    return { showtimes: enrichedShowtimes };
  } catch (error) {
    console.error("Get showtimes error:", error);
    throw error;
  }
};

/**
 * Get showtimes by movie
 */
export const getShowtimesByMovie = async (movieId) => {
  try {
    // Backend endpoint: GET /showtimes/movie/{movieId}
    const showtimes = await axiosInstance.get(
      API_ENDPOINTS.SHOWTIMES_BY_MOVIE(movieId)
    );

    const enrichedShowtimes = await enrichShowtimesWithNames(
      Array.isArray(showtimes) ? showtimes : []
    );

    return { showtimes: enrichedShowtimes };
  } catch (error) {
    console.error("Get showtimes by movie error:", error);
    throw error;
  }
};

/**
 * Get showtimes by cinema
 */
export const getShowtimesByCinema = async (cinemaId, date) => {
  try {
    const params = { cinemaId };
    if (date) params.date = date;

    const showtimes = await axiosInstance.get(API_ENDPOINTS.SHOWTIMES, {
      params,
    });
    return { showtimes: Array.isArray(showtimes) ? showtimes : [] };
  } catch (error) {
    console.error("Get showtimes by cinema error:", error);
    throw error;
  }
};

/**
 * Get showtime by ID
 */
export const getShowtimeById = async (id) => {
  try {
    // Backend endpoint: GET /showtimes/{showtimeId}
    const showtime = await axiosInstance.get(API_ENDPOINTS.SHOWTIME_BY_ID(id));
    return showtime;
  } catch (error) {
    console.error("Get showtime error:", error);
    throw error;
  }
};

/**
 * Create showtime
 */
export const createShowtime = async (showtimeData) => {
  try {
    // Backend endpoint: POST /showtimes
    // Body theo ShowTimeRequest
    const payload = {
      movieId: showtimeData.movieId,
      roomId: showtimeData.roomId,
      startTime: showtimeData.startTime, // Format: "yyyy-MM-dd'T'HH:mm:ss"
      endTime: showtimeData.endTime, // Format: "yyyy-MM-dd'T'HH:mm:ss"
    };

    const showtime = await axiosInstance.post(API_ENDPOINTS.SHOWTIMES, payload);
    return showtime;
  } catch (error) {
    console.error("Create showtime error:", error);
    throw error;
  }
};

/**
 * Create bulk showtimes - Tạo nhiều lịch chiếu cùng lúc
 */
export const createBulkShowtimes = async (showtimesArray) => {
  try {
    const created = [];

    // Tạo tuần tự từng showtime
    for (const st of showtimesArray) {
      const newShowtime = await createShowtime(st);
      created.push(newShowtime);
    }

    return { showtimes: created };
  } catch (error) {
    console.error("Create bulk showtimes error:", error);
    throw error;
  }
};

/**
 * Update showtime
 */
export const updateShowtime = async (id, showtimeData) => {
  try {
    // Backend endpoint: PUT /showtimes/{showtimeId}
    const payload = {
      movieId: showtimeData.movieId,
      roomId: showtimeData.roomId,
      startTime: showtimeData.startTime,
      endTime: showtimeData.endTime,
    };

    const showtime = await axiosInstance.put(
      API_ENDPOINTS.SHOWTIME_BY_ID(id),
      payload
    );
    return showtime;
  } catch (error) {
    console.error("Update showtime error:", error);
    throw error;
  }
};

/**
 * Delete showtime
 */
export const deleteShowtime = async (id) => {
  try {
    // Backend endpoint: DELETE /showtimes/{showtimeId}
    await axiosInstance.delete(API_ENDPOINTS.SHOWTIME_BY_ID(id));
  } catch (error) {
    console.error("Delete showtime error:", error);
    throw error;
  }
};

/**
 * Check showtime conflict - Kiểm tra trùng lịch
 */
export const checkShowtimeConflict = async (data) => {
  try {
    // Lấy tất cả showtimes của room trong ngày đó
    const date = data.startTime.split("T")[0]; // Extract date from ISO string
    const response = await axiosInstance.get(API_ENDPOINTS.SHOWTIMES, {
      params: { roomId: data.roomId, date },
    });

    const showtimes = Array.isArray(response) ? response : [];

    // Get movie duration
    const movie = await axiosInstance.get(
      API_ENDPOINTS.MOVIE_BY_ID(data.movieId)
    );

    const startTime = new Date(data.startTime);
    const endTime = new Date(
      startTime.getTime() + (movie.duration + 15) * 60000
    ); // +15 phút dọn dẹp

    // Check conflicts
    for (const st of showtimes) {
      if (data.excludeId && st.showtimeId === data.excludeId) continue;

      const existingStart = new Date(st.startTime);
      const existingEnd = new Date(st.endTime);

      // Kiểm tra chồng lấn thời gian
      if (startTime < existingEnd && endTime > existingStart) {
        const existingMovie = await axiosInstance.get(
          API_ENDPOINTS.MOVIE_BY_ID(st.movieId)
        );

        return {
          hasConflict: true,
          conflictShowtime: {
            movieTitle: existingMovie.title,
            startTime: st.startTime,
          },
        };
      }
    }

    return { hasConflict: false };
  } catch (error) {
    console.error("Check showtime conflict error:", error);
    throw error;
  }
};

/**
 * Copy showtime to another date
 */
export const copyShowtime = async (id, targetDate) => {
  try {
    const original = await getShowtimeById(id);

    // Tạo datetime mới từ targetDate và giờ của original
    const originalStart = new Date(original.startTime);
    const originalEnd = new Date(original.endTime);

    const [year, month, day] = targetDate.split("-");
    const newStart = new Date(originalStart);
    newStart.setFullYear(year, month - 1, day);

    const newEnd = new Date(originalEnd);
    newEnd.setFullYear(year, month - 1, day);

    return await createShowtime({
      movieId: original.movieId,
      roomId: original.roomId,
      startTime: newStart.toISOString(),
      endTime: newEnd.toISOString(),
    });
  } catch (error) {
    console.error("Copy showtime error:", error);
    throw error;
  }
};

/**
 * Update showtime status (nếu backend support)
 */
export const updateShowtimeStatus = async (id, status) => {
  try {
    const showtime = await getShowtimeById(id);
    return await updateShowtime(id, {
      ...showtime,
      status, // Backend có thể có field status
    });
  } catch (error) {
    console.error("Update showtime status error:", error);
    throw error;
  }
};

/**
 * Get available seats for showtime
 */
export const getAvailableSeats = async (showtimeId) => {
  try {
    // Backend endpoint: GET /seats/per-showtime?showtimeId={showtimeId}
    const seats = await axiosInstance.get(API_ENDPOINTS.SEATS_PER_SHOWTIME, {
      params: { showtimeId },
    });

    return Array.isArray(seats) ? seats : [];
  } catch (error) {
    console.error("Get available seats error:", error);
    throw error;
  }
};

/**
 * Get showtime stats
 */
export const getShowtimeStats = async (params = {}) => {
  try {
    // Backend chưa có endpoint stats
    // Tạm tính từ client
    const showtimes = await axiosInstance.get(API_ENDPOINTS.SHOWTIMES, {
      params,
    });

    return {
      totalShowtimes: showtimes.length,
    };
  } catch (error) {
    console.error("Get showtime stats error:", error);
    return { totalShowtimes: 0 };
  }
};

/**
 * Helper function: Enrich showtimes with movie, cinema, room names
 */
const enrichShowtimesWithNames = async (showtimes) => {
  if (!showtimes || showtimes.length === 0) return [];

  try {
    // Fetch all related data at once
    const [moviesRes, roomsRes, cinemasRes] = await Promise.all([
      axiosInstance.get(API_ENDPOINTS.MOVIES),
      axiosInstance.get(API_ENDPOINTS.ROOMS),
      axiosInstance.get(API_ENDPOINTS.CINEMAS),
    ]);

    const movies = Array.isArray(moviesRes) ? moviesRes : [];
    const rooms = Array.isArray(roomsRes) ? roomsRes : [];
    const cinemas = Array.isArray(cinemasRes) ? cinemasRes : [];

    return showtimes.map((st) => {
      const movie = movies.find((m) => m.movieId === st.movieId);
      const room = rooms.find((r) => r.roomId === st.roomId);
      const cinema = cinemas.find((c) => c.cinemaId === room?.cinemaId);

      return {
        ...st,
        movieTitle: movie?.title || "N/A",
        roomName: room?.name || "N/A",
        cinemaName: cinema?.name || "N/A",
      };
    });
  } catch (error) {
    console.error("Enrich showtimes error:", error);
    return showtimes; // Return original if enrichment fails
  }
};
