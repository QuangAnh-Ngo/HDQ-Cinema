import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import SchedulePopup from './pages/SchedulePopup/SchedulePopup';
import SeatSelection from './pages/SeatSelection/SeatSelection';
import ConfirmPayment from './pages/ConfirmPayment/ConfirmPayment';
import LogIn from './pages/LogIn/LogIn';
import './App.css';

const { Content } = Layout;

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
};

const AppLayout = () => {
    const location = useLocation();
    const [selectedMovieId, setSelectedMovieId] = useState(null);

    const hideLayout = location.pathname === '/login';

    return (
        <Layout >
            {!hideLayout && <Header />}
            <Content style={{ padding: 0, marginTop: hideLayout ? 0 : 80 }}>
                <Routes>
                    <Route
                        path="/"
                        element={<HomePage setSelectedMovieId={setSelectedMovieId} />}
                    />
                    <Route
                        path="/movie-detail/:id"
                        element={<MovieDetail setSelectedMovieId={setSelectedMovieId} />}
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
                    <Route
                        path="/login"
                        element={<LogIn />}
                    />
                </Routes>
            </Content>
            {!hideLayout && <Footer />}
            {selectedMovieId && (
                <SchedulePopup
                    id={selectedMovieId}
                    onClose={() => setSelectedMovieId(null)}
                />
            )}
        </Layout>
    );
};

const App = () => (
    <Router>
        <AppLayout />
    </Router>
);

export default App;
