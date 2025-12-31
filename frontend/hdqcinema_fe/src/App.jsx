import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./user/components/Header/Header";
import Footer from "./user/components/Footer/Footer";
import HomePage from "./user/pages/HomePage/HomePage";
import MovieDetail from "./user/pages/MovieDetail/MovieDetail";
import SchedulePopup from "./user/pages/SchedulePopup/SchedulePopup";
import SeatSelection from "./user/pages/SeatSelection/SeatSelection";
import ConfirmPayment from "./user/pages/ConfirmPayment/ConfirmPayment";
import LogIn from "./user/pages/LogIn/LogIn";
import Register from "./user/pages/Register/Register";
import UserProtectedRoute from "./user/UserProtectedRoute";

import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminRoutes from "./admin/AdminRoutes";

import "./App.css";

const { Content } = Layout;

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const AppLayout = () => {
  const location = useLocation();
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const isAdminRoute = location.pathname.startsWith("/admin");

  const hideLayout =
    ["/login", "/register"].includes(location.pathname) || isAdminRoute;

  return (
    <Layout className="min-h-screen">
      {!hideLayout && <Header />}

      <Content
        style={{
          padding: 0,
          marginTop: hideLayout ? 0 : 80,
          minHeight: "calc(100vh - 80px)",
        }}
      >
        <Routes>
          {/* USER ROUTES */}
          <Route
            path="/"
            element={
              <UserProtectedRoute>
                <HomePage setSelectedMovieId={setSelectedMovieId} />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/movie-detail/:id"
            element={
              <UserProtectedRoute>
                <MovieDetail setSelectedMovieId={setSelectedMovieId} />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/seat-selection"
            element={
              <ProtectedRoute>
                <SeatSelection />
              </ProtectedRoute>
            }
          />

          <Route
            path="/confirm-payment"
            element={
              <ProtectedRoute>
                <ConfirmPayment />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LogIn />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute>
                <AdminRoutes />
              </AdminProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>

      {!hideLayout && <Footer />}

      {selectedMovieId && (
        <SchedulePopup
          id={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Layout>
  );
};

const App = () => (
  <Router>
    <AppLayout />
  </Router>
);

export default App;
