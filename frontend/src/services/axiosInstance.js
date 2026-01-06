// frontend/src/services/axiosInstance.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/cinemas";

const MOCK_AUTH_ONLY = true;

// ✅ Public endpoints - không cần token
const PUBLIC_ENDPOINTS = [
  "/movies/showing",
  "/movies/upcoming",
  "/movies/",
  "/theaters",
  "/showtimes",
  "/rooms",
  "/auth/token",
  "/auth/register",
  "/auth/introspect",
];

// ✅ Admin endpoints - cho phép GET với mock auth
const ADMIN_ENDPOINTS = [
  "/rooms",
  "/employees",
  "/accounts",
  "/movies",
  "/showtimes",
  "/members",
  "/roles",
  "/permissions",
  "/bookings",
];

// ✅ Payment endpoints - cho phép tất cả methods với mock auth
const MOCK_ALLOWED_ENDPOINTS = [
  "/payment/create_payment",
  "/payment/payment_infor",
  "/paymenturls/",
  "/bookings",
];

const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const isAdminEndpoint = (url) => {
  return ADMIN_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const isMockAllowedEndpoint = (url) => {
  return MOCK_ALLOWED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

const isMockMode = () => {
  const token = localStorage.getItem("token");
  return token && token.startsWith("mock-token-");
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    // ✅ 1. Public endpoints - no auth needed
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    // ✅ 2. Real auth mode - use Bearer token
    if (token && !isMockMode()) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // ✅ 3. Mock mode - handle different cases
    if (isMockMode() && user) {
      const parsedUser = JSON.parse(user);

      // Get role - handle both formats
      const userRole =
        parsedUser.role ||
        parsedUser.roles?.[0]?.replace("ROLE_", "") ||
        "MEMBER";

      // Check if user is staff
      const isStaff = ["ADMIN", "MANAGER", "EMPLOYEE"].includes(
        userRole.toUpperCase()
      );

      config.headers["X-Mock-User-Id"] = parsedUser.id;
      config.headers["X-Mock-User-Role"] = userRole;
      config.headers["X-Mock-Mode"] = "true";

      // ✅ 3a. Payment endpoints - allow all methods
      if (isMockAllowedEndpoint(config.url)) {
        console.log(
          "✅ Mock payment request:",
          config.method.toUpperCase(),
          config.url
        );
        return config;
      }

      // ✅ 3b. Admin endpoints with staff user
      if (isAdminEndpoint(config.url) && isStaff) {
        // Allow GET for all staff
        if (config.method.toLowerCase() === "get") {
          console.log("✅ Mock staff GET allowed:", config.url);
          return config;
        }

        // Allow POST/PUT/DELETE for specific endpoints
        const writeAllowedEndpoints = ["/bookings", "/payment"];
        const isWriteAllowed = writeAllowedEndpoints.some((ep) =>
          config.url.includes(ep)
        );

        if (isWriteAllowed) {
          console.log(
            "✅ Mock staff write allowed:",
            config.method.toUpperCase(),
            config.url
          );
          return config;
        }

        // Block other write operations in mock mode
        console.warn("🎭 Mock mode: Write operation blocked for", config.url);
        return Promise.reject({
          status: 401,
          message: "Mock mode - Write operations require real auth",
          mockMode: true,
        });
      }

      // ✅ 3c. Non-staff users - only allow payment endpoints
      if (!isStaff && !isMockAllowedEndpoint(config.url)) {
        console.warn("🎭 Mock mode: Non-staff blocked from", config.url);
        return Promise.reject({
          status: 403,
          message: "Mock mode - Insufficient permissions",
          mockMode: true,
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;

    // ✅ Extract result from standard backend response format
    if (data && data.code === 1000 && data.result !== undefined) {
      return data.result;
    }

    // ✅ Handle other successful responses
    if (data && data.result !== undefined) {
      return data.result;
    }

    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ 1. Public endpoints that got 401 - return empty data
    if (
      isPublicEndpoint(originalRequest?.url) &&
      error.response?.status === 401
    ) {
      if (MOCK_AUTH_ONLY) {
        console.log("ℹ️ Public endpoint got 401 - returning empty data");
        if (originalRequest.url.includes("/theaters")) return [];
        if (originalRequest.url.includes("/movies")) return [];
        return {};
      }
    }

    // ✅ 2. Mock mode errors - provide helpful messages
    if (isMockMode()) {
      // Payment/Booking endpoints
      if (
        isMockAllowedEndpoint(originalRequest?.url) &&
        error.response?.status === 401
      ) {
        console.error(
          "❌ Backend doesn't support mock auth for:",
          originalRequest.url
        );
        return Promise.reject({
          status: 401,
          message:
            "Backend chưa hỗ trợ mock auth.\n\nVui lòng đăng nhập với tài khoản thật.",
          mockMode: true,
          needRealAuth: true,
        });
      }

      // Admin endpoints - return empty data instead of blocking UI
      if (
        isAdminEndpoint(originalRequest?.url) &&
        error.response?.status === 401
      ) {
        console.warn(
          "⚠️ Mock admin endpoint got 401, returning empty data:",
          originalRequest.url
        );

        // Return appropriate empty data structure
        if (originalRequest.url.includes("/rooms")) return [];
        if (originalRequest.url.includes("/employees")) return [];
        if (originalRequest.url.includes("/accounts")) return [];
        if (originalRequest.url.includes("/bookings")) return [];
        if (originalRequest.url.includes("/showtimes")) return [];
        if (originalRequest.url.includes("/movies")) return [];
        if (originalRequest.url.includes("/theaters")) return [];

        return [];
      }
    }

    // ✅ 3. Real auth mode - handle 401 with token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isMockMode()
    ) {
      originalRequest._retry = true;
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        return Promise.reject({
          status: 401,
          message: "Unauthorized - No token",
        });
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token: currentToken,
        });

        const newToken = res.data.result.token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // ✅ 4. General error handling
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Đã xảy ra lỗi hệ thống";

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      code: error.response?.data?.code,
    });
  }
);

export default axiosInstance;
