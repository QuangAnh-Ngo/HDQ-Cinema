// frontend/src/services/axiosInstance.js
import axios from "axios";

// const API_BASE_URL = "http://localhost:8080/cinemas";
const API_BASE_URL = "/api/";

const MOCK_AUTH_ONLY = true;

// ✅ CRITICAL: Very specific public endpoint patterns
const PUBLIC_ENDPOINT_PATTERNS = [
  { path: "/movies/showing", exact: true },
  { path: "/movies/upcoming", exact: true },
  { path: "/theaters", method: "GET", exact: true }, // Only GET /theaters
  { path: "/auth/token", exact: false },
  { path: "/auth/register", exact: false },
  { path: "/auth/introspect", exact: false },
];

// ✅ Admin endpoints that require authentication
const ADMIN_ENDPOINT_PATTERNS = [
  { path: "/movies", methods: ["POST", "PUT", "DELETE"] },
  { path: "/rooms", methods: ["POST", "PUT", "DELETE"] },
  { path: "/employees", methods: ["POST", "PUT", "DELETE"] },
  { path: "/accounts", methods: ["POST", "PUT", "DELETE"] },
  { path: "/showtimes", methods: ["POST", "PUT", "DELETE"] },
  { path: "/theaters", methods: ["POST", "PUT", "DELETE"] },
  { path: "/bookings", methods: ["GET", "POST", "PUT", "DELETE"] },
  { path: "/members", methods: ["GET", "DELETE"] },
];

/**
 * ✅ IMPROVED: Check if endpoint is public
 */
const isPublicEndpoint = (url, method = "GET") => {
  if (!url) return false;

  return PUBLIC_ENDPOINT_PATTERNS.some((pattern) => {
    // Check method if specified
    if (pattern.method && method.toUpperCase() !== pattern.method) {
      return false;
    }

    // Exact match required
    if (pattern.exact) {
      return url === pattern.path || url === `${pattern.path}/`;
    }

    // Substring match
    return url.includes(pattern.path);
  });
};

/**
 * ✅ IMPROVED: Check if endpoint requires admin auth
 */
const isAdminEndpoint = (url, method = "GET") => {
  if (!url) return false;

  return ADMIN_ENDPOINT_PATTERNS.some((pattern) => {
    // Check if URL matches pattern
    const urlMatches =
      url.startsWith(pattern.path) || url.includes(pattern.path);

    if (!urlMatches) return false;

    // Check method if specified
    if (pattern.methods) {
      return pattern.methods.includes(method.toUpperCase());
    }

    return true;
  });
};

const isPaymentEndpoint = (url) => {
  if (!url) return false;
  const paymentPaths = ["/payment/", "/paymenturls/"];
  return paymentPaths.some((path) => url.includes(path));
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
    const method = config.method?.toUpperCase() || "GET";

    console.log("🔍 Request:", {
      url: config.url,
      method: method,
      hasToken: !!token,
      isMock: isMockMode(),
    });

    // ✅ 1. Check if public endpoint
    if (isPublicEndpoint(config.url, method)) {
      console.log("✅ Public endpoint - no auth needed");
      return config;
    }

    // ✅ 2. Check if admin endpoint
    const requiresAuth = isAdminEndpoint(config.url, method);

    if (requiresAuth) {
      console.log("🔒 Admin endpoint - auth required");
    }

    // ✅ 3. Real auth mode
    if (token && !isMockMode()) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Real auth token attached");
      return config;
    }

    // ✅ 4. Mock mode
    if (isMockMode() && user) {
      const parsedUser = JSON.parse(user);
      const userRole =
        parsedUser.role ||
        parsedUser.roles?.[0]?.replace("ROLE_", "") ||
        "MEMBER";
      const isStaff = ["ADMIN", "MANAGER", "EMPLOYEE"].includes(
        userRole.toUpperCase()
      );

      config.headers["X-Mock-User-Id"] = parsedUser.id;
      config.headers["X-Mock-User-Role"] = userRole;
      config.headers["X-Mock-Mode"] = "true";

      console.log("🎭 Mock mode:", { role: userRole, isStaff });

      // Payment endpoints - allow all users
      if (isPaymentEndpoint(config.url)) {
        console.log("✅ Payment endpoint allowed");
        return config;
      }

      // Admin endpoints - check staff + block writes
      if (requiresAuth) {
        if (!isStaff) {
          console.warn("🚫 Non-staff blocked from admin endpoint");
          return Promise.reject({
            status: 403,
            message: "Không có quyền truy cập",
            mockMode: true,
          });
        }

        // Block write operations in mock mode
        if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
          console.warn("🚫 Mock mode: Write operation blocked");
          return Promise.reject({
            status: 401,
            message:
              "Mock mode không hỗ trợ thao tác ghi dữ liệu. Vui lòng đăng nhập với tài khoản thật.",
            mockMode: true,
          });
        }

        console.log("✅ Mock staff GET allowed");
        return config;
      }

      // Other endpoints - allow with mock headers
      return config;
    }

    // ✅ 5. No auth available
    if (requiresAuth) {
      console.warn("🚫 No authentication for protected endpoint");
      return Promise.reject({
        status: 401,
        message: "Vui lòng đăng nhập",
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => {
    const { data } = response;

    if (data && data.code === 1000 && data.result !== undefined) {
      return data.result;
    }

    if (data && data.result !== undefined) {
      return data.result;
    }

    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject({
        status: 500,
        message: "Internal error",
      });
    }

    const method = originalRequest.method?.toUpperCase() || "GET";

    console.error("❌ Response error:", {
      url: originalRequest.url,
      method: method,
      status: error.response?.status,
      message: error.response?.data?.message,
    });

    // ✅ 1. Handle 401 for public endpoints only
    if (error.response?.status === 401) {
      // ONLY return empty data for actual public endpoints
      if (isPublicEndpoint(originalRequest.url, method)) {
        console.log("ℹ️ Public endpoint got 401 - returning empty data");
        return [];
      }

      // For protected endpoints, try token refresh (real auth only)
      if (!isMockMode() && !originalRequest._retry) {
        originalRequest._retry = true;
        const currentToken = localStorage.getItem("token");

        if (currentToken) {
          try {
            console.log("🔄 Attempting token refresh...");

            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              token: currentToken,
            });

            const newToken = res.data.result.token;
            localStorage.setItem("token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            console.log("✅ Token refreshed, retrying request");
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("❌ Token refresh failed");
            localStorage.clear();
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
      }

      // If we reach here, 401 is genuine
      return Promise.reject({
        status: 401,
        message: error.response?.data?.message || "Unauthorized",
        code: error.response?.data?.code,
      });
    }

    // ✅ 2. Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn("⚠️ 403 Forbidden");

      if (originalRequest.url?.includes("/bookings")) {
        return Promise.resolve([]);
      }

      return Promise.reject({
        status: 403,
        message: error.response?.data?.message || "Không có quyền truy cập",
        code: error.response?.data?.code,
      });
    }

    // ✅ 3. General error
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
