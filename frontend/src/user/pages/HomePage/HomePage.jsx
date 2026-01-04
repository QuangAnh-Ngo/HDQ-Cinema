import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Spin, message } from "antd";
import { movieService } from "../../../services";
import MovieItem from "../../components/MovieItem/MovieItem";
import Banner from "../../components/Banner/Banner";
import ScheduleModal from "../../components/ScheduleModal/ScheduleModal";
import "./HomePage.scss";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const cinemaId =
    location.state?.cinemaId ||
    localStorage.getItem("selectedCinemaId") ||
    null;

  const [activeTab, setActiveTab] = useState("showing");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === "showing") {
        // ✅ Truyền cinemaId vào query param 'c'
        data = await movieService.getShowing(cinemaId || "");
      } else {
        data = await movieService.getUpcoming(cinemaId || "");
      }
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
      message.error("Không thể tải danh sách phim");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, cinemaId]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleMovieClick = (movieId) => {
    navigate(`/movie-detail/${movieId}`, {
      state: { cinemaId },
    });
  };

  const handleBuyTicket = (movieId) => {
    if (!cinemaId) {
      message.warning("Vui lòng chọn rạp trước!");
      return;
    }
    setSelectedMovieId(movieId);
    setScheduleModalVisible(true);
  };

  const handleSelectShowtime = (showtimeId) => {
    setScheduleModalVisible(false);
    navigate("/seat-selection", {
      state: {
        movieId: selectedMovieId,
        showtimeId: showtimeId,
        cinemaId: cinemaId,
      },
    });
  };

  const MovieList = ({ data }) => (
    <div className="movie-list">
      {data.map((movie) => (
        <MovieItem
          key={movie.id}
          movie={movie}
          onMovieClick={handleMovieClick}
          onBuyTicket={handleBuyTicket}
          cinemaId={cinemaId}
        />
      ))}
    </div>
  );

  const tabItems = [
    {
      key: "showing",
      label: "Phim Đang Chiếu",
      children: (
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : movies.length > 0 ? (
            <MovieList data={movies} />
          ) : (
            <div className="no-movies">
              <p>
                {cinemaId
                  ? "Hiện tại không có phim nào đang chiếu tại rạp này"
                  : "Vui lòng chọn rạp để xem phim đang chiếu"}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "upcoming",
      label: "Phim Sắp Chiếu",
      children: (
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : movies.length > 0 ? (
            <MovieList data={movies} />
          ) : (
            <div className="no-movies">
              <p>
                {cinemaId
                  ? "Hiện tại chưa có lịch phim sắp chiếu tại rạp này"
                  : "Vui lòng chọn rạp để xem phim sắp chiếu"}
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="main bg-[#f9f9f9]">
      {/* {!loading && movies.length > 0 && <Banner movies={movies.slice(0, 5)} />} */}

      <div className="homepage-container">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={tabItems}
          className="custom-home-tabs"
        />
      </div>

      {scheduleModalVisible && selectedMovieId && cinemaId && (
        <ScheduleModal
          visible={scheduleModalVisible}
          movieId={selectedMovieId}
          cinemaId={cinemaId}
          onClose={() => setScheduleModalVisible(false)}
          onSelectShowtime={handleSelectShowtime}
        />
      )}
    </div>
  );
};

export default HomePage;
