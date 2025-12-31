import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Card, Button } from "antd";
import { getMovieById } from "../../services/api";
import "./MovieDetail.scss";

const MovieDetail = ({ setSelectedMovieId }) => {
  const location = useLocation();
  const cinemaId = location.state?.cinema_id || null;

  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };
    fetchMovie();
  }, [id]);

  if (!movie) {
    return (
      <div className="loading">
        <p>Đang tải thông tin phim...</p>
      </div>
    );
  }

  return (
    <div className="main">
      <section className="movie" id="movie">
        <div className="movie-items">
          <div className="movie-poster">
            <img src={movie.poster} alt={movie.title} />
          </div>

          <div className="movie-description">
            <h2 className="movie-title">{movie.title}</h2>
            <p className="movie-summary">{movie.description}</p>
            <ul>
              <li>
                <strong>Đạo diễn:</strong> {movie.director}
              </li>
              {/* <li><strong>Diễn viên:</strong> {movie.actor || movie.actor.join(', ')}</li> */}
              <li>
                <strong>Thể loại:</strong>{" "}
                {movie.genre || movie.genre.join(", ")}
              </li>
              <li>
                <strong>Thời lượng:</strong> {movie.duration} phút
              </li>
              {/* <li><strong>Ngôn ngữ:</strong> {movie.language}</li> */}
              <li>
                <strong>Ngày khởi chiếu:</strong> {movie.day_start}
              </li>
            </ul>
          </div>
        </div>

        <Button
          type="primary"
          className="button"
          data-title={movie.title}
          onClick={() => {
            if (!cinemaId) {
              alert("Vui lòng chọn rạp trước khi xem lịch chiếu!");
              return;
            }
            setSelectedMovieId(movie.movie_id);
          }}
        >
          Mua vé
        </Button>
      </section>

      <section className="trailer" id="trailer">
        <h2>Trailer</h2>
        <iframe
          src={movie.trailer_url}
          title={`${movie.title} - Trailer`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </section>
    </div>
  );
};

export default MovieDetail;
