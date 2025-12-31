import { useState, useEffect } from "react";
import { FiFilm, FiMapPin, FiGrid, FiShoppingBag } from "react-icons/fi";
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
      const mockStats = {
        totalMovies: 25,
        totalCinemas: 8,
        totalRooms: 45,
        totalBookings: 1234,
        popularMovies: [
          { id: 1, title: "Avatar 2", bookings: 450 },
          { id: 2, title: "Mai", bookings: 380 },
          { id: 3, title: "Kungfu Panda 4", bookings: 320 },
        ],
      };

      await new Promise((resolve) => setTimeout(resolve, 500));
      setStats(mockStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
