const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Ví dụ các endpoints của bạn - THAY ĐỔI theo API backend thật
  MOVIES: `${API_BASE_URL}/api/movies`,
  USERS: `${API_BASE_URL}/api/users`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  AUTH: `${API_BASE_URL}/api/auth`,
  // Thêm các endpoints khác...
};

// Helper function để fetch dễ dàng hơn
export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};

export default API_BASE_URL;