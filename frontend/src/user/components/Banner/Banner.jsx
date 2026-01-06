// frontend/src/user/components/Banner/Banner.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import "./Banner.scss";

const Banner = ({ movies, cinemaId }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef(null);

  const totalMovies = movies.length;

  // ✅ Auto play
  useEffect(() => {
    if (totalMovies <= 1) return;

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5000); // 5 giây tự động chuyển

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, totalMovies]);

  // ✅ Reset auto play khi user interaction
  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalMovies);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + totalMovies) % totalMovies);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleDotClick = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    resetAutoPlay();
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie-detail/${movieId}`, {
      state: { cinemaId },
    });
  };

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="banner-container">
      <div className="banner-wrapper">
        {/* Background Image */}
        <div
          className="banner-background"
          style={{ backgroundImage: `url(${currentMovie.poster})` }}
        >
          <div className="banner-overlay" />
        </div>

        {/* Content */}
        <div className="banner-content">
          <div className="banner-info">
            <div className="movie-meta">
              <span className="genre-tag">{currentMovie.genre}</span>
            </div>
            <h1 className="movie-title">{currentMovie.title}</h1>
            <p className="movie-description">
              {currentMovie.description?.substring(0, 150)}
              {currentMovie.description?.length > 150 && "..."}
            </p>
            <div className="movie-details">
              <span className="age-rating">T{currentMovie.limitAge}</span>
              <span className="duration">{currentMovie.duration} phút</span>
              <span className="director">{currentMovie.director}</span>
            </div>
            <button
              className="view-detail-btn"
              onClick={() => handleMovieClick(currentMovie.id)}
            >
              Xem chi tiết
            </button>
          </div>

          {/* Movie Cards Carousel */}
          <div className="banner-carousel">
            <button
              className="carousel-btn prev-btn"
              onClick={() => {
                handlePrev();
                resetAutoPlay();
              }}
              disabled={isTransitioning}
            >
              <LeftOutlined />
            </button>

            <div className="carousel-track">
              {movies.map((movie, index) => {
                // Calculate position relative to current
                let position = index - currentIndex;
                if (position < -2) position += totalMovies;
                if (position > 2) position -= totalMovies;

                return (
                  <div
                    key={movie.id}
                    className={`carousel-item ${
                      index === currentIndex ? "active" : ""
                    } ${position === -1 ? "prev" : ""} ${
                      position === 1 ? "next" : ""
                    } ${Math.abs(position) > 1 ? "hidden" : ""}`}
                    onClick={() => {
                      if (index !== currentIndex) {
                        handleDotClick(index);
                      } else {
                        handleMovieClick(movie.id);
                      }
                    }}
                  >
                    <img src={movie.poster} alt={movie.title} />
                    <div className="item-overlay">
                      <p className="item-genre">{movie.genre}</p>
                      <h3 className="item-title">{movie.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className="carousel-btn next-btn"
              onClick={() => {
                handleNext();
                resetAutoPlay();
              }}
              disabled={isTransitioning}
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="banner-dots">
          {movies.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Banner.propTypes = {
  movies: PropTypes.array.isRequired,
  cinemaId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Banner;
