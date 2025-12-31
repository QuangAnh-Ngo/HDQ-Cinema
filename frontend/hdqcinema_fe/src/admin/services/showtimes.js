import adminApi from "./adminApi";
import {
  adaptShowtimesFromDB,
  adaptShowtimeFromDB,
  adaptShowtimeForDB,
} from "../utils/dataAdapters";

export const getShowtimes = async (params = {}) => {
  try {
    const response = await adminApi.get("/showtimes", { params });
    const showtimes = response.data.showtimes || response.data;

    // Enrich with movie, cinema, room names
    const enrichedShowtimes = await enrichShowtimesWithNames(
      adaptShowtimesFromDB(showtimes)
    );

    return { showtimes: enrichedShowtimes };
  } catch (error) {
    throw (
      error.response?.data || { message: "Lỗi khi tải danh sách lịch chiếu" }
    );
  }
};

// Helper function to enrich showtimes with names
const enrichShowtimesWithNames = async (showtimes) => {
  try {
    const [moviesRes, cinemasRes, roomsRes] = await Promise.all([
      adminApi.get("/movies"),
      adminApi.get("/cinemas"),
      adminApi.get("/rooms"),
    ]);

    const movies = moviesRes.data.movies || moviesRes.data;
    const cinemas = cinemasRes.data.cinemas || cinemasRes.data;
    const rooms = roomsRes.data.rooms || roomsRes.data;

    return showtimes.map((st) => {
      const movie = movies.find((m) => m.id === st.movieId);
      const cinema = cinemas.find((c) => c.id === st.cinemaId);
      const room = rooms.find((r) => r.id === st.roomId);

      return {
        ...st,
        movieTitle: movie?.title,
        cinemaName: cinema?.name,
        roomName: room?.name || room?.room_name,
      };
    });
  } catch (error) {
    return showtimes;
  }
};

export const getShowtimesByMovie = async (movieId) => {
  try {
    const response = await adminApi.get(`/showtimes?movieId=${movieId}`);
    const showtimes = response.data.showtimes || response.data;
    return {
      showtimes: await enrichShowtimesWithNames(
        adaptShowtimesFromDB(showtimes)
      ),
    };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải lịch chiếu" };
  }
};

export const getShowtimesByCinema = async (cinemaId, date) => {
  try {
    let url = `/showtimes?cinemaId=${cinemaId}`;
    if (date) url += `&date=${date}`;

    const response = await adminApi.get(url);
    const showtimes = response.data.showtimes || response.data;
    return { showtimes: adaptShowtimesFromDB(showtimes) };
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải lịch chiếu" };
  }
};

export const getShowtimeById = async (id) => {
  try {
    const response = await adminApi.get(`/showtimes/${id}`);
    return adaptShowtimeFromDB(response.data);
  } catch (error) {
    throw (
      error.response?.data || { message: "Lỗi khi tải chi tiết lịch chiếu" }
    );
  }
};

export const createShowtime = async (showtimeData) => {
  try {
    const allShowtimes = await getShowtimes();
    const newId = Math.max(...allShowtimes.showtimes.map((st) => st.id), 0) + 1;

    const dataToSend = adaptShowtimeForDB({
      ...showtimeData,
      id: newId,
      createdAt: new Date().toISOString(),
    });

    const response = await adminApi.post("/showtimes", dataToSend);
    return adaptShowtimeFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tạo lịch chiếu" };
  }
};

export const createBulkShowtimes = async (showtimesArray) => {
  try {
    const created = [];
    for (const st of showtimesArray) {
      const newShowtime = await createShowtime(st);
      created.push(newShowtime);
    }
    return { showtimes: created };
  } catch (error) {
    throw (
      error.response?.data || { message: "Lỗi khi tạo lịch chiếu hàng loạt" }
    );
  }
};

export const updateShowtime = async (id, showtimeData) => {
  try {
    const dataToSend = adaptShowtimeForDB({
      ...showtimeData,
      id,
      updatedAt: new Date().toISOString(),
    });

    const response = await adminApi.put(`/showtimes/${id}`, dataToSend);
    return adaptShowtimeFromDB(response.data);
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi cập nhật lịch chiếu" };
  }
};

export const deleteShowtime = async (id) => {
  try {
    const response = await adminApi.delete(`/showtimes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi xóa lịch chiếu" };
  }
};

export const checkShowtimeConflict = async (data) => {
  try {
    // Get all showtimes for the room on that date
    const response = await adminApi.get(
      `/showtimes?roomId=${data.roomId}&date=${data.date}`
    );
    const showtimes = response.data.showtimes || response.data;

    // Get movie duration
    const movieRes = await adminApi.get(`/movies/${data.movieId}`);
    const movie = movieRes.data;

    const [hours, minutes] = data.startTime.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + movie.duration + 15;

    for (const st of showtimes) {
      if (data.excludeId && st.id === data.excludeId) continue;

      const existingMovie = (await adminApi.get(`/movies/${st.movieId}`)).data;
      const [existingHours, existingMinutes] = st.startTime
        .split(":")
        .map(Number);
      const existingStart = existingHours * 60 + existingMinutes;
      const existingEnd = existingStart + existingMovie.duration + 15;

      if (startMinutes < existingEnd && endMinutes > existingStart) {
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
    throw error.response?.data || { message: "Lỗi khi kiểm tra trùng lịch" };
  }
};

export const copyShowtime = async (id, targetDate) => {
  try {
    const original = await getShowtimeById(id);
    return await createShowtime({
      ...original,
      date: targetDate,
    });
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi sao chép lịch chiếu" };
  }
};

export const updateShowtimeStatus = async (id, status) => {
  try {
    const showtime = await getShowtimeById(id);
    return await updateShowtime(id, {
      ...showtime,
      status,
    });
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi thay đổi trạng thái" };
  }
};

export const getShowtimeStats = async (params = {}) => {
  try {
    const response = await adminApi.get("/showtimes/stats", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải thống kê" };
  }
};

export const getAvailableSeats = async (showtimeId) => {
  try {
    const response = await adminApi.get(
      `/showtimes/${showtimeId}/available-seats`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Lỗi khi tải danh sách ghế" };
  }
};
