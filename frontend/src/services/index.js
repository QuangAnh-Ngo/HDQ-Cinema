// frontend/src/services/index.js
/**
 * Barrel export - Tập hợp tất cả các services để dễ dàng import trong toàn bộ ứng dụng.
 * Giúp code gọn hơn: import { movieService, authService } from "@/services";
 */

export { default as axiosInstance } from "./axiosInstance";

// frontend/src/services/index.js
export { default as authService } from "./authService";
export { default as movieService } from "./movieService";
export { default as cinemaService } from "./cinemaService";
export { default as roomService } from "./roomService";
export { default as seatService } from "./seatService";
export { default as showtimeService } from "./showtimeService";
export { default as bookingService } from "./bookingService";
export { default as paymentService } from "./paymentService";
export { default as memberService } from "./memberService";
export { default as employeeService } from "./employeeService";
export { default as accountService } from "./accountService"; // ✅ New
export { default as roleService } from "./roleService";
export { default as permissionService } from "./permissionService";
export { default as ticketPriceService } from "./ticketPriceService";
export { default as dayTypeService } from "./dayTypeService";
