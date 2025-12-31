import { getMovies } from "../../services/api";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs } from "antd";
import MovieItem from "../../components/MovieItem/MovieItem";
import Banner from "../../components/Banner/Banner";
import "./HomePage.scss";

const HomePage = ({ setSelectedMovieId }) => {
  const location = useLocation();
  const cinemaId = location.state?.cinema_id || null;
  // const [genre, setGenre] = useState('');
  // const [year, setYear] = useState('');
  // thêm filter khác nếu muốn
  const [activeTab, setActiveTab] = useState("showing");

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // const fetchMoviesFromAPI = async (filters = {}) => {
  //     setLoading(true);
  //     try {
  //         const data = await getMovies(filters);
  //         setMovies(data);
  //     } catch (err) {
  //         console.error(err);
  //         message.error(err.message || 'Không tải được phim');
  //         setMovies([]);
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  // useEffect(() => {
  //     fetchMoviesFromAPI({ tab: activeTab, genre });
  // }, []);

  // const handleTabChange = (key) => {
  //     setActiveTab(key);
  //     fetchMoviesFromAPI({ tab: key, genre });
  // };

  // const handleGenreChange = (e) => {
  //     const value = e.target.value;
  //     setGenre(value);
  //     fetchMoviesFromAPI({ tab: activeTab, genre: value });
  // };

  // Tạm thời filter theo sắp/đang chiếu, sau sẽ gọi api của be
  const filteredMovies = movies.filter((movie) => {
    const releaseDate = new Date(movie.day_start);
    const now = new Date("2025-10-23");
    if (activeTab === "showing") return releaseDate < now;
    return releaseDate >= now;
  });

  const tabItems = [
    {
      key: "showing",
      label: "Phim Đang Chiếu",
      children: (
        <div className="movie-list">
          {filteredMovies.map((movie) => (
            <MovieItem
              key={movie.movie_id}
              movie={movie}
              setSelectedMovieId={setSelectedMovieId}
              cinemaId={cinemaId}
            />
          ))}
        </div>
      ),
    },
    {
      key: "upcoming",
      label: "Phim Sắp Chiếu",
      children: (
        <div className="movie-list">
          {filteredMovies.map((movie) => (
            <MovieItem
              key={movie.movie_id}
              movie={movie}
              setSelectedMovieId={setSelectedMovieId}
              cinemaId={cinemaId}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="main">
      {/* <Banner movies={movies} /> */}

      <div className="homepage-container">
        {/* <div className="filter-bar"> //chưa css
                    <select onChange={e => handleFilterGenre(e.target.value)} value={genre}>
                        <option value="">Tất cả thể loại</option>
                        <option value="Action">Action</option>
                        <option value="Drama">Drama</option>
                        <option value="Animation">Animation</option>
                    </select>
                </div> */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={tabItems}
        />
      </div>
    </div>
  );
};

export default HomePage;
