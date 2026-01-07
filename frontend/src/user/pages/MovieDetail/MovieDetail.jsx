import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, Spin, message, Modal, Tag } from "antd";
import {
  ClockCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  StarFilled,
  PlayCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
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

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      const videoId = match[2];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

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

  const handleBuyTicket = () => {
    if (!cinemaId) {
      Modal.warning({
        title: "Thông báo",
        content:
          "Vui lòng chọn rạp chiếu tại khu vực của bạn trước khi đặt vé!",
        okText: "Đã hiểu",
        onOk: () => {
          navigate("/");
        },
      });
      return;
    }

    setShowScheduleModal(true);
  };

  const handleShowtimeSelect = (showtimeId) => {
    console.log("🎯 Selected showtimeId:", showtimeId);
    setShowScheduleModal(false);
    navigate("/seat-selection", {
      state: {
        showtimeId: showtimeId,
        movieId: id,
        cinemaId: cinemaId,
      },
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p className="loading-text">Đang tải thông tin phim...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="error-container">
        <div className="error-content">
          <h2>Không tìm thấy phim</h2>
          <p>Phim bạn đang tìm kiếm không tồn tại hoặc đã bị xóa</p>
          <Button
            type="primary"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <div className="movie-hero">
        <div
          className="hero-background"
          style={{ backgroundImage: `url(${movie.poster})` }}
        >
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <button className="back-button" onClick={() => navigate("/")}>
            <ArrowLeftOutlined /> Quay lại
          </button>

          <div className="movie-info-container">
            <div className="movie-poster-wrapper">
              <img
                src={movie.poster}
                alt={movie.title}
                className="movie-poster"
                onError={(e) => {
                  e.target.src = "/placeholder-poster.jpg";
                }}
              />
              <div className="poster-badge">
                <Tag color="red" className="age-tag">
                  T{movie.limitAge}
                </Tag>
              </div>
            </div>

            <div className="movie-details-wrapper">
              <h1 className="movie-title">{movie.title}</h1>

              <div className="movie-meta">
                <Tag color="blue" className="genre-tag">
                  {movie.genre}
                </Tag>
                {movie.rating && (
                  <span className="rating-badge">
                    <StarFilled className="star-icon" />
                    <span className="rating-value">{movie.rating}/10</span>
                  </span>
                )}
              </div>

              <p className="movie-description">{movie.description}</p>

              <div className="info-grid">
                <div className="info-item">
                  <UserOutlined className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Đạo diễn</span>
                    <span className="info-value">{movie.director}</span>
                  </div>
                </div>

                <div className="info-item">
                  <ClockCircleOutlined className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Thời lượng</span>
                    <span className="info-value">{movie.duration} phút</span>
                  </div>
                </div>

                <div className="info-item">
                  <CalendarOutlined className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Khởi chiếu</span>
                    <span className="info-value">{movie.dayStart}</span>
                  </div>
                </div>

                <div className="info-item">
                  <CalendarOutlined className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Kết thúc</span>
                    <span className="info-value">{movie.dayEnd}</span>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                className="buy-ticket-btn"
                onClick={handleBuyTicket}
                icon={<PlayCircleOutlined />}
              >
                Mua vé ngay
              </Button>
            </div>
          </div>
        </div>
      </div>

      {movie.trailer_url && (
        <section className="trailer-section">
          <div className="trailer-container">
            <h2 className="trailer-title">
              <PlayCircleOutlined className="trailer-icon" />
              Trailer Phim
            </h2>
            <div className="trailer-wrapper">
              <iframe
                className="trailer-iframe"
                src={getYouTubeEmbedUrl(movie.trailer_url)}
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
