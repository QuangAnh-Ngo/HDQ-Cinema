// frontend/src/config/api.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/cinemas";

export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: "/auth/token",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_INTROSPECT: "/auth/introspect",

  // Movies
  MOVIES: "/movies",
  MOVIE_BY_ID: (id) => `/movies/${id}`,

  // Cinemas
  CINEMAS: "/cinemas",
  CINEMA_BY_ID: (id) => `/cinemas/${id}`,

  // Rooms
  ROOMS: "/rooms",
  ROOM_BY_ID: (id) => `/rooms/${id}`,
  ROOMS_FOR_SHOWTIME: "/rooms/for-showtime",

  // ShowTimes
  SHOWTIMES: "/showtimes",
  SHOWTIME_BY_ID: (id) => `/showtimes/${id}`,
  SHOWTIMES_BY_MOVIE: (movieId) => `/showtimes/movie/${movieId}`,

  // Bookings
  BOOKINGS: "/bookings",
  BOOKING_BY_ID: (id) => `/bookings/${id}`,
  BOOKINGS_PENDING_AMOUNT: "/bookings/amount-of-pending-bookings",

  // Members
  MEMBERS: "/members",
  MEMBER_BY_ID: (id) => `/members/${id}`,

  // Employees
  EMPLOYEES: "/employees",
  EMPLOYEE_BY_ID: (id) => `/employees/${id}`,
  EMPLOYEE_ACCOUNTS: "/employee-accounts",
  EMPLOYEE_ACCOUNT_BY_ID: (id) => `/employee-accounts/${id}`,

  // Seats
  SEATS: "/seats",
  SEATS_PER_SHOWTIME: "/seats/per-showtime",

  // Payments
  PAYMENT: "/payment",
  PAYMENT_URLS: "/payment-url",
  PAYMENT_URL_BY_ID: (id) => `/payment-url/${id}`,

  // Roles & Permissions
  ROLES: "/roles",
  ROLE_BY_NAME: (name) => `/roles/${name}`,
  PERMISSIONS: "/permissions",
  PERMISSION_BY_NAME: (name) => `/permissions/${name}`,

  // Ticket Prices
  TICKET_PRICES: "/ticket-prices",
  TICKET_PRICE_BY_ID: (id) => `/ticket-prices/${id}`,

  // Day Types
  DAY_TYPES: "/day-types",
  DAY_TYPE_BY_ID: (id) => `/day-types/${id}`,
};

export default API_BASE_URL;
