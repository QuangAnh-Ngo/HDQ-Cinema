// frontend/src/user/pages/MovieDetail/MovieDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Spin, message, Modal } from "antd";
import { movieService } from "../../../services";
import ScheduleModal from "../../components/ScheduleModal/ScheduleModal";
import "./MovieDetail.scss";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const cinemaId =
    location.state?.cinemaId ||
    localStorage.getItem("selectedCinemaId") ||
    null;

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  /**
   * Tải thông tin chi tiết phim
   */
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const data = await movieService.getById(id);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
        message.error("Không thể tải thông tin phim");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  /**
   * Xử lý khi nhấn nút Mua vé
   */
  const handleBuyTicket = () => {
    if (!cinemaId) {
      Modal.warning({
        title: "Thông báo",
        content:
          "Vui lòng chọn rạp chiếu tại khu vực của bạn trước khi đặt vé!",
        okText: "Đã hiểu",
        onOk: () => {
          navigate("/"); // Quay về trang chủ để chọn rạp
        },
      });
      return;
    }

    setShowScheduleModal(true);
  };

  /**
   * Xử lý khi chọn một suất chiếu từ Modal
   */
  const handleShowtimeSelect = (showtimeId) => {
    setShowScheduleModal(false);
    navigate("/seat-selection", {
      state: {
        movieId: id,
        showtimeId: showtimeId,
        cinemaId: cinemaId,
      },
    });
  };

  if (loading) {
    return (
      <div className="loading-container flex justify-center items-center h-screen bg-[#f9f9f9]">
        <Spin size="large" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-container text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy phim</h2>
        <Button type="primary" onClick={() => navigate("/")}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="main">
      {/* Movie Info Section */}
      <section className="movie" id="movie">
        <div className="movie-items">
          {/* Movie Poster */}
          <div className="movie-poster shadow-2xl">
            <img
              src={movie.poster}
              alt={movie.title}
              onError={(e) => {
                e.target.src = "/placeholder-poster.jpg";
              }}
            />
          </div>

          {/* Movie Description */}
          <div className="movie-description">
            <h2 className="movie-title">{movie.title}</h2>
            <div className="movie-tags my-4 flex gap-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded font-bold text-xs">
                T{movie.limitAge}
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {movie.genre}
              </span>
            </div>

            <p className="movie-summary text-gray-600 leading-relaxed mb-6">
              {movie.description}
            </p>

            <ul className="movie-details">
              <li>
                <strong>Đạo diễn:</strong> {movie.director}
              </li>
              <li>
                <strong>Thời lượng:</strong> {movie.duration} phút
              </li>
              <li>
                <strong>Khởi chiếu:</strong> {movie.dayStart}
              </li>
              <li>
                <strong>Kết thúc:</strong> {movie.dayEnd}
              </li>
              <li>
                <strong>Đánh giá:</strong> {movie.rating || "Chưa có"}/10 ⭐
              </li>
            </ul>

            <div className="mt-8">
              <Button
                type="primary"
                size="large"
                className="buy-ticket-btn"
                onClick={handleBuyTicket}
              >
                Mua vé ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Section */}
      {movie.trailer_url && (
        <section className="trailer" id="trailer">
          <h2>Trailer Phim</h2>
          <div className="trailer-container mt-8 flex justify-center px-4">
            <div className="relative w-full max-w-4xl aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl shadow-2xl"
                src={movie.trailer_url.replace("watch?v=", "embed/")}
                title={`${movie.title} - Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      <ScheduleModal
        visible={showScheduleModal}
        movieId={id}
        cinemaId={cinemaId}
        onClose={() => setShowScheduleModal(false)}
        onSelectShowtime={handleShowtimeSelect}
      />
    </div>
  );
};

export default MovieDetail;
