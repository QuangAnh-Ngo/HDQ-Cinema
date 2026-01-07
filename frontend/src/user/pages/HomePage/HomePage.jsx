import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Spin, message } from "antd";
import { movieService } from "../../../services";
import MovieItem from "../../components/MovieItem/MovieItem";
import Banner from "../../components/Banner/Banner";
import MovieFilter from "../../components/MovieFilter/MovieFilter";
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
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeTab === "showing") {
        data = await movieService.getShowing(cinemaId || "");
      } else {
        data = await movieService.getUpcoming(cinemaId || "");
      }
      setMovies(data);
      setFilteredMovies(data);
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

  const handleFilterChange = useCallback(
    (filters) => {
      console.log("🔍 Applying filters:", filters);

      let result = [...movies];

      if (filters.genre !== "all") {
        result = result.filter((movie) => movie.genre?.includes(filters.genre));
      }

      if (filters.ageRating !== "all") {
        const ageValue =
          filters.ageRating === "P" ? 0 : parseInt(filters.ageRating);
        result = result.filter((movie) => {
          if (filters.ageRating === "P") {
            return movie.limitAge === 0 || movie.limitAge < 13;
          }
          return movie.limitAge >= ageValue && movie.limitAge < ageValue + 3;
        });
      }

      switch (filters.sortBy) {
        case "name-asc":
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "name-desc":
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "duration-asc":
          result.sort((a, b) => a.duration - b.duration);
          break;
        case "duration-desc":
          result.sort((a, b) => b.duration - a.duration);
          break;
        case "latest":
        default:
          break;
      }

      console.log("✅ Filtered results:", result.length);
      setFilteredMovies(result);
    },
    [movies]
  );

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
    console.log("🎬 HomePage - Selected showtimeId:", showtimeId);
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
          ) : filteredMovies.length > 0 ? (
            <MovieList data={filteredMovies} />
          ) : (
            <div className="no-movies">
              <p>
                {movies.length === 0
                  ? cinemaId
                    ? "Hiện tại không có phim nào đang chiếu tại rạp này"
                    : "Vui lòng chọn rạp để xem phim đang chiếu"
                  : "Không tìm thấy phim phù hợp với bộ lọc"}{" "}
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
          ) : filteredMovies.length > 0 ? (
            <MovieList data={filteredMovies} />
          ) : (
            <div className="no-movies">
              <p>
                {movies.length === 0
                  ? cinemaId
                    ? "Hiện tại chưa có lịch phim sắp chiếu tại rạp này"
                    : "Vui lòng chọn rạp để xem phim sắp chiếu"
                  : "Không tìm thấy phim phù hợp với bộ lọc"}
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="main bg-[#f9f9f9]">
      {movies.length > 0 && (
        <Banner movies={movies.slice(0, 5)} cinemaId={cinemaId} />
      )}

      <div className="homepage-container">
        {movies.length > 0 && (
          <MovieFilter
            onFilterChange={handleFilterChange}
            totalMovies={filteredMovies.length}
          />
        )}

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
