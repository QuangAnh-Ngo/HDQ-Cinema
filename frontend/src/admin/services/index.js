// frontend/src/admin/services/index.js
// Barrel export for admin services
// These are wrappers around main services for backward compatibility

export * from "./movies";
export * from "./cinemas";
export * from "./rooms";
export * from "./employees";
export * from "./showtimes";
export * from "./bookings";

// You can also import directly from main services
export {
  movieService,
  cinemaService,
  roomService,
  employeeService,
  employeeAccountService,
  showtimeService,
  bookingService,
  seatService,
  authService,
} from "../../services";
