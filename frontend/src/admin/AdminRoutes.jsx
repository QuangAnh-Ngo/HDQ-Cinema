import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Common/Sidebar";
import Header from "./components/Common/Header";
import AdminDashboard from "./pages/AdminDashboard";
import Movies from "./pages/Movies";
import Cinemas from "./pages/Cinemas";
import Rooms from "./pages/Rooms";
import Showtimes from "./pages/Showtimes";
import Bookings from "./pages/Bookings";
import Employees from "./pages/Employees";
import AdminProtectedRoute from "./AdminProtectedRoute";
import "./styles/AdminLayout.scss";

const AdminRoutes = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header />
        <main>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/showtimes" element={<Showtimes />} />
            <Route path="/bookings" element={<Bookings />} />

            <Route
              path="/employees"
              element={
                <AdminProtectedRoute allowedRoles={["admin"]}>
                  <Employees />
                </AdminProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminRoutes;
