// frontend/src/admin/AdminRoutes.jsx
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
import Members from "./pages/Members";
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
            {/* Default redirect */}
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* ===== ALL STAFF ===== */}
            <Route
              path="/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />

            {/* ===== EMPLOYEE, MANAGER, ADMIN ===== */}
            <Route
              path="/movies"
              element={
                <AdminProtectedRoute
                  allowedRoles={["EMPLOYEE", "MANAGER", "ADMIN"]}
                >
                  <Movies />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/showtimes"
              element={
                <AdminProtectedRoute
                  allowedRoles={["EMPLOYEE", "MANAGER", "ADMIN"]}
                >
                  <Showtimes />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <AdminProtectedRoute
                  allowedRoles={["EMPLOYEE", "MANAGER", "ADMIN"]}
                >
                  <Bookings />
                </AdminProtectedRoute>
              }
            />

            {/* ===== MANAGER, ADMIN ===== */}
            <Route
              path="/cinemas"
              element={
                <AdminProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                  <Cinemas />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/rooms"
              element={
                <AdminProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                  <Rooms />
                </AdminProtectedRoute>
              }
            />

            {/* ===== MANAGER, ADMIN - Employee Management ===== */}
            <Route
              path="/employees"
              element={
                <AdminProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                  <Employees />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="members"
              element={
                <AdminProtectedRoute
                  allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}
                >
                  <Members />
                </AdminProtectedRoute>
              }
            />

            {/* 404 - Redirect to dashboard */}
            <Route
              path="*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminRoutes;
