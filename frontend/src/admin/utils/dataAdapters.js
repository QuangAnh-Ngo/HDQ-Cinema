// src/admin/utils/dataAdapters.js
// Convert giữa database format và admin format

/**
 * Convert Cinema từ database format sang admin format
 */
export const adaptCinemaFromDB = (dbCinema) => {
  return {
    id: dbCinema.id || parseInt(dbCinema.cinema_id?.replace("CIN", "")) || 0,
    cinema_id: dbCinema.cinema_id,
    name: dbCinema.name,
    city: dbCinema.city,
    district: dbCinema.district,
    address: dbCinema.address,
    phone: dbCinema.phone || "",
    email: dbCinema.email || "",
    description: dbCinema.description || "",
    facilities: dbCinema.facilities || [],
    latitude: dbCinema.latitude || "",
    longitude: dbCinema.longitude || "",
    status: dbCinema.status || "active",
    createdAt: dbCinema.createdAt || new Date().toISOString(),
    updatedAt: dbCinema.updatedAt || new Date().toISOString(),
  };
};

/**
 * Convert Cinema từ admin format sang database format
 */
export const adaptCinemaForDB = (adminCinema) => {
  return {
    id: adminCinema.id,
    cinema_id:
      adminCinema.cinema_id || `CIN${String(adminCinema.id).padStart(3, "0")}`,
    name: adminCinema.name,
    city: adminCinema.city,
    district: adminCinema.district || "",
    address: adminCinema.address,
    phone: adminCinema.phone,
    email: adminCinema.email,
    description: adminCinema.description,
    facilities: adminCinema.facilities,
    latitude: adminCinema.latitude,
    longitude: adminCinema.longitude,
    status: adminCinema.status,
    createdAt: adminCinema.createdAt,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert Movie từ database format sang admin format
 */
export const adaptMovieFromDB = (dbMovie) => {
  return {
    id: dbMovie.id || parseInt(dbMovie.movie_id?.replace("MV", "")) || 0,
    movie_id: dbMovie.movie_id,
    title: dbMovie.title,
    description: dbMovie.description || "",
    duration: dbMovie.duration,
    releaseDate: dbMovie.releaseDate || dbMovie.day_start,
    day_start: dbMovie.day_start,
    day_end: dbMovie.day_end,
    director: dbMovie.director || "",
    cast: dbMovie.cast || "",
    genre: dbMovie.genre || "",
    language: dbMovie.language || "Phụ đề Việt",
    rating: dbMovie.rating || dbMovie.limit_age ? `T${dbMovie.limit_age}` : "",
    limit_age: dbMovie.limit_age,
    trailer: dbMovie.trailer || dbMovie.trailer_url,
    trailer_url: dbMovie.trailer_url,
    poster: dbMovie.poster || "",
    status: dbMovie.status || "coming_soon",
    createdAt: dbMovie.createdAt || new Date().toISOString(),
    updatedAt: dbMovie.updatedAt || new Date().toISOString(),
  };
};

/**
 * Convert Movie từ admin format sang database format
 */
export const adaptMovieForDB = (adminMovie) => {
  return {
    id: adminMovie.id,
    movie_id:
      adminMovie.movie_id || `MV${String(adminMovie.id).padStart(3, "0")}`,
    title: adminMovie.title,
    description: adminMovie.description,
    duration: parseInt(adminMovie.duration),
    releaseDate: adminMovie.releaseDate,
    day_start: adminMovie.releaseDate,
    day_end: adminMovie.day_end || adminMovie.releaseDate,
    director: adminMovie.director,
    cast: adminMovie.cast,
    genre: adminMovie.genre,
    language: adminMovie.language,
    rating: adminMovie.rating,
    limit_age: parseInt(adminMovie.rating?.replace("T", "")) || 13,
    trailer: adminMovie.trailer,
    trailer_url: adminMovie.trailer,
    poster: adminMovie.poster,
    status: adminMovie.status,
    createdAt: adminMovie.createdAt,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert Room từ database format sang admin format
 */
export const adaptRoomFromDB = (dbRoom) => {
  return {
    id: dbRoom.id || parseInt(dbRoom.room_id?.replace("R", "")) || 0,
    room_id: dbRoom.room_id,
    name: dbRoom.name || dbRoom.room_name,
    room_name: dbRoom.room_name || dbRoom.name,
    cinemaId: dbRoom.cinemaId || dbRoom.cinema_id || 0,
    cinema_id: dbRoom.cinema_id,
    type: dbRoom.type || "2D",
    capacity: dbRoom.capacity || 0,
    rows: dbRoom.rows || 10,
    seatsPerRow: dbRoom.seatsPerRow || 12,
    status: dbRoom.status || "active",
    seats: (dbRoom.seats || []).map(adaptSeatFromDB),
    createdAt: dbRoom.createdAt || new Date().toISOString(),
    updatedAt: dbRoom.updatedAt || new Date().toISOString(),
  };
};

/**
 * Convert Room từ admin format sang database format
 */
export const adaptRoomForDB = (adminRoom) => {
  return {
    id: adminRoom.id,
    room_id: adminRoom.room_id || `R${String(adminRoom.id).padStart(3, "0")}`,
    name: adminRoom.name,
    room_name: adminRoom.name,
    cinemaId: adminRoom.cinemaId,
    cinema_id:
      adminRoom.cinema_id ||
      `CIN${String(adminRoom.cinemaId).padStart(3, "0")}`,
    type: adminRoom.type,
    capacity: parseInt(adminRoom.capacity),
    rows: parseInt(adminRoom.rows),
    seatsPerRow: parseInt(adminRoom.seatsPerRow),
    status: adminRoom.status,
    seats: (adminRoom.seats || []).map(adaptSeatForDB),
    createdAt: adminRoom.createdAt,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert Seat từ database format sang admin format
 */
export const adaptSeatFromDB = (dbSeat) => {
  // Map seat_type: VIP -> vip, CLASSIC -> standard
  const typeMap = {
    VIP: "vip",
    CLASSIC: "standard",
    COUPLE: "couple",
    vip: "vip",
    standard: "standard",
    couple: "couple",
  };

  return {
    id: dbSeat.id || dbSeat.seat_id,
    seat_id: dbSeat.seat_id,
    row: dbSeat.row || dbSeat.seat_row,
    seat_row: dbSeat.seat_row || dbSeat.row,
    number: dbSeat.number || dbSeat.seat_number,
    seat_number: dbSeat.seat_number || dbSeat.number,
    type: typeMap[dbSeat.type] || typeMap[dbSeat.seat_type] || "standard",
    seat_type: dbSeat.seat_type,
    status: dbSeat.status || "available",
  };
};

/**
 * Convert Seat từ admin format sang database format
 */
export const adaptSeatForDB = (adminSeat) => {
  // Map type: vip -> VIP, standard -> CLASSIC
  const typeMap = {
    vip: "VIP",
    standard: "CLASSIC",
    couple: "COUPLE",
    empty: "EMPTY",
  };

  return {
    id: adminSeat.id,
    seat_id: adminSeat.seat_id || adminSeat.id,
    row: adminSeat.row,
    seat_row: adminSeat.row,
    number: adminSeat.number,
    seat_number: adminSeat.number,
    type: adminSeat.type,
    seat_type: typeMap[adminSeat.type] || "CLASSIC",
    room_id: adminSeat.room_id,
    status: adminSeat.status,
  };
};

/**
 * Convert Showtime từ database format sang admin format
 */
export const adaptShowtimeFromDB = (dbShowtime) => {
  // Parse ISO datetime to date and time
  let date = "";
  let startTime = "";

  if (dbShowtime.start_time) {
    const dt = new Date(dbShowtime.start_time);
    date = dt.toISOString().split("T")[0];
    startTime = dt.toTimeString().substring(0, 5);
  }

  return {
    id:
      dbShowtime.id || parseInt(dbShowtime.showtime_id?.replace("ST", "")) || 0,
    showtime_id: dbShowtime.showtime_id,
    movieId:
      dbShowtime.movieId ||
      parseInt(dbShowtime.movie_id?.replace("MV", "")) ||
      0,
    movie_id: dbShowtime.movie_id,
    cinemaId:
      dbShowtime.cinemaId ||
      parseInt(dbShowtime.cinema_id?.replace("CIN", "")) ||
      0,
    cinema_id: dbShowtime.cinema_id,
    roomId:
      dbShowtime.roomId || parseInt(dbShowtime.room_id?.replace("R", "")) || 0,
    room_id: dbShowtime.room_id,
    date: dbShowtime.date || date,
    startTime: dbShowtime.startTime || startTime,
    start_time: dbShowtime.start_time,
    price: dbShowtime.price || 45000,
    status: dbShowtime.status || "active",
    createdAt: dbShowtime.createdAt || new Date().toISOString(),
    updatedAt: dbShowtime.updatedAt || new Date().toISOString(),
  };
};

/**
 * Convert Showtime từ admin format sang database format
 */
export const adaptShowtimeForDB = (adminShowtime) => {
  // Combine date and time to ISO datetime
  const start_time = `${adminShowtime.date}T${adminShowtime.startTime}:00`;

  return {
    id: adminShowtime.id,
    showtime_id:
      adminShowtime.showtime_id ||
      `ST${String(adminShowtime.id).padStart(3, "0")}`,
    movieId: adminShowtime.movieId,
    movie_id:
      adminShowtime.movie_id ||
      `MV${String(adminShowtime.movieId).padStart(3, "0")}`,
    cinemaId: adminShowtime.cinemaId,
    cinema_id:
      adminShowtime.cinema_id ||
      `CIN${String(adminShowtime.cinemaId).padStart(3, "0")}`,
    roomId: adminShowtime.roomId,
    room_id:
      adminShowtime.room_id ||
      `R${String(adminShowtime.roomId).padStart(3, "0")}`,
    date: adminShowtime.date,
    startTime: adminShowtime.startTime,
    start_time,
    price: parseInt(adminShowtime.price),
    status: adminShowtime.status,
    createdAt: adminShowtime.createdAt,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Convert Booking từ database format sang admin format
 */
export const adaptBookingFromDB = (dbBooking) => {
  return {
    id: dbBooking.id || parseInt(dbBooking.booking_id?.replace("B", "")) || 0,
    booking_id: dbBooking.booking_id,
    code: dbBooking.code || dbBooking.booking_id,
    userId:
      dbBooking.userId || parseInt(dbBooking.user_id?.replace("MB", "")) || 0,
    user_id: dbBooking.user_id,
    userName: dbBooking.userName || "",
    userEmail: dbBooking.userEmail || "",
    userPhone: dbBooking.userPhone || "",
    showtimeId: dbBooking.showtimeId || 0,
    showtime_id: dbBooking.showtime_id,
    movieId: dbBooking.movieId || 0,
    movie_id: dbBooking.movie_id,
    movieTitle: dbBooking.movieTitle || "",
    cinemaId: dbBooking.cinemaId || 0,
    cinema_id: dbBooking.cinema_id,
    cinemaName: dbBooking.cinemaName || "",
    roomId: dbBooking.roomId || 0,
    room_id: dbBooking.room_id,
    roomName: dbBooking.roomName || "",
    showDate: dbBooking.showDate || "",
    showTime: dbBooking.showTime || "",
    seats: dbBooking.seats || [],
    ticketPrice: dbBooking.ticketPrice || 0,
    totalAmount: dbBooking.totalAmount || dbBooking.total_price || 0,
    total_price: dbBooking.total_price || dbBooking.totalAmount,
    discount: dbBooking.discount || 0,
    paymentMethod: dbBooking.paymentMethod || "Cash",
    paymentStatus: dbBooking.paymentStatus || "pending",
    status:
      dbBooking.status || dbBooking.booking_status?.toLowerCase() || "pending",
    booking_status: dbBooking.booking_status,
    createdAt:
      dbBooking.createdAt || dbBooking.create_time || new Date().toISOString(),
    create_time: dbBooking.create_time || dbBooking.createdAt,
    updatedAt: dbBooking.updatedAt || new Date().toISOString(),
  };
};

/**
 * Convert Employee từ database format sang admin format
 */
export const adaptEmployeeFromDB = (dbEmployee) => {
  return {
    id:
      dbEmployee.id ||
      parseInt(dbEmployee.employee_id?.replace("EMP", "")) ||
      0,
    employee_id: dbEmployee.employee_id,
    username: dbEmployee.username,
    name: dbEmployee.name || dbEmployee.full_name || "",
    email: dbEmployee.email || "",
    phone: dbEmployee.phone || "",
    role: dbEmployee.role || "manager", // admin hoặc manager
    status: dbEmployee.status || "active",
    createdAt:
      dbEmployee.createdAt ||
      dbEmployee.create_time ||
      new Date().toISOString(),
    updatedAt: dbEmployee.updatedAt || new Date().toISOString(),
  };
};

/**
 * Convert Employee từ admin format sang database format
 */
export const adaptEmployeeForDB = (adminEmployee) => {
  return {
    id: adminEmployee.id,
    employee_id:
      adminEmployee.employee_id ||
      `EMP${String(adminEmployee.id).padStart(3, "0")}`,
    username: adminEmployee.username,
    password: adminEmployee.password, // Chỉ gửi password khi tạo mới/cập nhật
    name: adminEmployee.name,
    email: adminEmployee.email,
    phone: adminEmployee.phone,
    role: adminEmployee.role,
    status: adminEmployee.status,
    createdAt: adminEmployee.createdAt,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Batch adapters - convert arrays
 */
export const adaptCinemasFromDB = (cinemas) => cinemas.map(adaptCinemaFromDB);
export const adaptMoviesFromDB = (movies) => movies.map(adaptMovieFromDB);
export const adaptRoomsFromDB = (rooms) => rooms.map(adaptRoomFromDB);
export const adaptShowtimesFromDB = (showtimes) =>
  showtimes.map(adaptShowtimeFromDB);
export const adaptBookingsFromDB = (bookings) =>
  bookings.map(adaptBookingFromDB);
export const adaptEmployeesFromDB = (employees) =>
  Array.isArray(employees) ? employees.map(adaptEmployeeFromDB) : [];
