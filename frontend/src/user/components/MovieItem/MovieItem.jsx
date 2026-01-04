// frontend/src/user/components/MovieItem/MovieItem.jsx
import { Card, Button, Modal, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { ShoppingOutlined } from "@ant-design/icons";
import "./MovieItem.scss";

const MovieItem = ({ movie, onMovieClick, onBuyTicket, cinemaId }) => {
  const navigate = useNavigate();
  // Giới hạn ký tự để kích hoạt hiệu ứng chạy chữ (marquee)
  const isTitleOverflow = movie.title && movie.title.length > 18;

  const handleTitleClick = (e) => {
    e.preventDefault();
    if (onMovieClick) {
      onMovieClick(movie.id); // Backend dùng id
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

  return (
    <div className="movieitem_container">
      <Card
        hoverable
        className="border-none shadow-sm"
        cover={
          <div className="relative overflow-hidden group">
            <img
              alt={movie.title}
              src={movie.poster} // Backend dùng poster
              className="transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.src = "/placeholder-poster.jpg";
              }}
            />
            {/* Tag độ tuổi hiển thị đè lên ảnh */}
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
