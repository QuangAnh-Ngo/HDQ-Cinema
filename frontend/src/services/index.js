// frontend/src/services/index.js
/**
 * Barrel export - Tập hợp tất cả các services để dễ dàng import trong toàn bộ ứng dụng.
 * Giúp code gọn hơn: import { movieService, authService } from "@/services";
 */

export { default as axiosInstance } from "./axiosInstance";

export { authService } from "./authService";
export { movieService } from "./movieService";
export { cinemaService } from "./cinemaService";
export { showtimeService } from "./showtimeService";
export { bookingService } from "./bookingService";
export { seatService } from "./seatService";
export { roomService } from "./roomService";
export { ticketPriceService } from "./ticketPriceService";
export { dayTypeService } from "./dayTypeService";
export { paymentService } from "./paymentService";
export { memberService } from "./memberService";
export { employeeService } from "./employeeService";
export { accountService } from "./accountService";
export { roleService } from "./roleService";
export { permissionService } from "./permissionService";
