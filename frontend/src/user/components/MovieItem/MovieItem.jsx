import { useState } from "react";
import { Card, Button, Modal, Tag, Skeleton } from "antd";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { ShoppingOutlined } from "@ant-design/icons";
import "./MovieItem.scss";

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

const MovieItem = ({ movie, onMovieClick, onBuyTicket, cinemaId }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isTitleOverflow = movie.title && movie.title.length > 18;

  const isValidUrl = (url) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const getPosterUrl = () => {
    if (imageError || !isValidUrl(movie.poster)) {
      return PLACEHOLDER_IMAGE;
    }
    return movie.poster;
  };

  const handleTitleClick = (e) => {
    e.preventDefault();
    if (onMovieClick) {
      onMovieClick(movie.id);
    } else {
      navigate(`/movie-detail/${movie.id}`, {
        state: { cinemaId },
      });
    }
  };

  const handleBuyTicket = (e) => {
    e.stopPropagation();

    if (!cinemaId) {
      Modal.warning({
        title: "Thông báo",
        content:
          "Vui lòng chọn rạp chiếu tại khu vực của bạn trước khi đặt vé!",
        okText: "Đã hiểu",
      });
      return;
    }

    if (!onBuyTicket) {
      console.error("MovieItem: onBuyTicket prop is required!");
      Modal.error({
        title: "Lỗi",
        content:
          "Chức năng mua vé chưa được cấu hình đúng. Vui lòng liên hệ hỗ trợ.",
      });
      return;
    }

    onBuyTicket(movie.id);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Ẩn skeleton
  };

  return (
    <div className="movieitem_container">
      <Card
        hoverable
        className="border-none shadow-sm"
        cover={
          <div className="relative overflow-hidden group poster-container">
            {!imageLoaded && (
              <Skeleton.Image
                active
                className="poster-skeleton"
                style={{ width: "100%", height: "100%" }}
              />
            )}

            <img
              alt={movie.title}
              src={getPosterUrl()}
              loading="lazy"
              decoding="async"
              className={`poster-image transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? "loaded" : "loading"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            <div className="absolute top-2 left-2 z-10">
              <Tag color="#f50" className="font-bold border-none m-0 uppercase">
                T{movie.limitAge}
              </Tag>
            </div>
          </div>
        }
        onClick={handleTitleClick}
      >
        <Card.Meta
          title={
            isTitleOverflow ? (
              <div className="movie-title marquee" onClick={handleTitleClick}>
                <span className="marquee-content">
                  {movie.title}
                  <span className="marquee-separator"> • </span>
                  {movie.title}
                </span>
              </div>
            ) : (
              <div className="movie-title" onClick={handleTitleClick}>
                {movie.title}
              </div>
            )
          }
          description={
            <div className="movie-info">
              <ul>
                <li>
                  <strong>Thể loại:</strong>
                  <span>{movie.genre || "N/A"}</span>
                </li>
                <li>
                  <strong>Thời lượng:</strong>
                  <span>{movie.duration} phút</span>
                </li>
                <li>
                  <strong>Đánh giá:</strong>
                  <span></span>
                </li>
              </ul>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
                className="buy-button"
                onClick={handleBuyTicket}
              >
                MUA VÉ
              </Button>
            </div>
          }
        />
      </Card>
    </div>
  );
};

MovieItem.propTypes = {
  movie: PropTypes.object.isRequired,
  onMovieClick: PropTypes.func,
  onBuyTicket: PropTypes.func.isRequired,
  cinemaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default MovieItem;
