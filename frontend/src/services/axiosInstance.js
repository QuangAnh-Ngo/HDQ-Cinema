// frontend/src/services/axiosInstance.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080/cinemas";

// ✅ CONFIG: Cho phép mock auth nhưng vẫn gọi API thật cho data
const MOCK_AUTH_ONLY = true; // Mock authentication, nhưng data lấy từ backend thật

const PUBLIC_ENDPOINTS = [
  "/movies/showing",
  "/movies/upcoming",
  "/movies/",
  "/theaters",
  "/auth/token",
  "/auth/register",
  "/auth/introspect",
];

const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// ✅ Kiểm tra mock mode (sync với authService)
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

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // ✅ Public endpoints KHÔNG GỬI TOKEN (dù mock hay thật)
    if (isPublicEndpoint(config.url)) {
      // Không gửi Authorization header
      return config;
    }

    // ✅ Protected endpoints: chỉ gửi token thật
    if (token && !isMockMode()) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data && data.result !== undefined) {
      return data.result;
    }
    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ Public endpoints + 401 → Trả về empty data
    if (
      isPublicEndpoint(originalRequest.url) &&
      error.response?.status === 401
    ) {
      if (MOCK_AUTH_ONLY) {
        console.log("ℹ️ Public endpoint got 401 - trả về empty data");

        // ✅ Kiểm tra endpoint để trả đúng kiểu dữ liệu
        if (originalRequest.url.includes("/theaters")) {
          return []; // GET /theaters trả về array
        }
        if (originalRequest.url.includes("/movies")) {
          return []; // GET /movies/* trả về array
        }
        return {}; // Default trả về object
      }
    }

    // ✅ Protected endpoints + Mock mode → Block
    if (isMockMode() && !isPublicEndpoint(originalRequest.url)) {
      console.warn("🎭 Mock auth: Protected endpoint blocked");
      return Promise.reject({
        status: 401,
        message: "Mock mode - Protected endpoint requires real auth",
        mockMode: true,
      });
    }

    // ✅ REAL API MODE - Xử lý 401 như bình thường
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const currentToken = localStorage.getItem("token");

      // Không có token → không redirect
      if (!currentToken) {
        return Promise.reject({
          status: 401,
          message: "Unauthorized - No token",
        });
      }

      // Có token → thử refresh
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          token: currentToken,
        });

        const newToken = res.data.result.token;
        localStorage.setItem("token", newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → redirect
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // Trích xuất lỗi
    const errorMessage =
      error.response?.data?.message || "Đã xảy ra lỗi hệ thống";

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      code: error.response?.data?.code,
    });
  }
);

export default axiosInstance;
