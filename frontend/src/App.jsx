import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Layout } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "./user/components/Header/Header";
import Footer from "./user/components/Footer/Footer";

import HomePage from "./user/pages/HomePage/HomePage";
import MovieDetail from "./user/pages/MovieDetail/MovieDetail";
import SeatSelection from "./user/pages/SeatSelection/SeatSelection";
import ConfirmPayment from "./user/pages/ConfirmPayment/ConfirmPayment";
import PaymentResult from "./user/pages/PaymentResult/PaymentResult";
import LogIn from "./user/pages/LogIn/LogIn";
import Register from "./user/pages/Register/Register";

import UserProtectedRoute from "./user/UserProtectedRoute";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminRoutes from "./admin/AdminRoutes";

import "./App.css";

const { Content } = Layout;

const HEADER_HEIGHT = 80;
const PUBLIC_ROUTES = ["/login", "/register"];

const shouldHideLayout = (pathname) => {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/admin");
};

const AppLayout = () => {
  const location = useLocation();
  const hideLayout = shouldHideLayout(location.pathname);

  return (
    <Layout className="min-h-screen">
      {!hideLayout && <Header />}

      <Content
        style={{
          marginTop: hideLayout ? 0 : HEADER_HEIGHT,
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <UserProtectedRoute requireAuth={false}>
                <HomePage />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/movie-detail/:id"
            element={
              <UserProtectedRoute requireAuth={false}>
                <MovieDetail />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/seat-selection/:showtimeId"
            element={
              <UserProtectedRoute requireAuth={true}>
                <SeatSelection />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/confirm-payment/:bookingId"
            element={
              <UserProtectedRoute requireAuth={true}>
                <ConfirmPayment />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/payment-result"
            element={
              <UserProtectedRoute requireAuth={true}>
                <PaymentResult />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <AdminProtectedRoute
                allowedRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}
              >
                <AdminRoutes />
              </AdminProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>

      {!hideLayout && <Footer />}

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
