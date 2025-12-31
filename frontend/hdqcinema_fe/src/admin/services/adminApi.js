import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/";

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - BỎ TOKEN ĐI khi test với JSON Server
adminApi.interceptors.request.use(
  (config) => {
    // Tạm thời comment token
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Tạm thời comment redirect
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default adminApi;
