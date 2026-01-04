import { useState, useEffect } from "react";
import { FiFilm, FiMapPin, FiGrid, FiShoppingBag } from "react-icons/fi";
import { getMovies } from "../services/movies";
import { getCinemas } from "../services/cinemas";
import { getRooms } from "../services/rooms";
import { getBookings } from "../services/bookings";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import "../styles/AdminLayout.scss";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Gọi tất cả API cùng lúc để tối ưu thời gian
      const [moviesRes, cinemasRes, roomsRes, bookingsRes] = await Promise.all([
        getMovies(),
        getCinemas(),
        getRooms(),
        getBookings(),
      ]);

      const allBookings = bookingsRes.bookings || [];
      const today = new Date().toISOString().split("T")[0];

      // Tính toán thống kê từ dữ liệu thật
      setStats({
        totalMovies: (moviesRes.movies || []).length,
        totalCinemas: (cinemasRes.cinemas || []).length,
        totalRooms: (roomsRes.rooms || []).length,
        totalBookings: allBookings.length,
        todayRevenue: allBookings
          .filter(
            (b) => b.createdAt?.startsWith(today) && b.status === "confirmed"
          )
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        popularMovies: calculateTopMovies(allBookings),
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTopMovies = (bookings) => {
    const counts = bookings.reduce((acc, b) => {
      acc[b.movieTitle] = (acc[b.movieTitle] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([title, count], idx) => ({ id: idx, title, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 3);
  };

  if (loading) {
    return <Loading text="Đang tải dashboard..." />;
  }

  return (
    <div>
      <Breadcrumb />

      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}
        >
          Dashboard
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Tổng quan hệ thống đặt vé phim
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng số phim</p>
              <h3>{stats.totalMovies}</h3>
            </div>
            <div className="stat-icon blue">
              <FiFilm size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Rạp chiếu</p>
              <h3>{stats.totalCinemas}</h3>
            </div>
            <div className="stat-icon green">
              <FiMapPin size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Phòng chiếu</p>
              <h3>{stats.totalRooms}</h3>
            </div>
            <div className="stat-icon purple">
              <FiGrid size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Vé đã bán</p>
              <h3>{stats.totalBookings}</h3>
            </div>
            <div className="stat-icon orange">
              <FiShoppingBag size={24} />
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}
        >
          Top phim hot
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {stats.popularMovies.map((movie, index) => (
            <div
              key={movie.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    backgroundColor: index === 0 ? "#fef3c7" : "#f3f4f6",
                    color: index === 0 ? "#92400e" : "#374151",
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <p style={{ fontWeight: 600, margin: "0 0 4px 0" }}>
                    {movie.title}
                  </p>
                  <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                    {movie.bookings} vé đã bán
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
