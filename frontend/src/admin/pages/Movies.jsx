// frontend/src/admin/pages/Movies.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";
import { movieService } from "../../services";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import MovieForm from "../components/MovieForm";
import { message } from "antd";
import "../styles/MoviesPage.scss";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showMovieForm, setShowMovieForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  // ✅ Memoize calculateMovieStatus to prevent unnecessary recalculations
  const calculateMovieStatus = useCallback((movie) => {
    if (!movie.dayStart || !movie.dayEnd) return "ended";

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    const startDate = new Date(movie.dayStart);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(movie.dayEnd);
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate) return "coming_soon";
    if (today >= startDate && today <= endDate) return "now_showing";
    return "ended";
  }, []);

  // ✅ Fetch movies only once on mount
  useEffect(() => {
    fetchMovies();
  }, []); // Empty dependency array - only run once

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await movieService.getAll();

      // ✅ Process data once and set state
      const moviesWithStatus = (Array.isArray(data) ? data : []).map(
        (movie) => ({
          ...movie,
          status: calculateMovieStatus(movie),
        })
      );

      console.log("✅ Movies loaded:", moviesWithStatus.length);
      setMovies(moviesWithStatus);
    } catch (error) {
      console.error("Error fetching movies:", error);
      message.error("Không thể lấy danh sách phim");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Use useMemo to calculate filtered movies
  const filteredMovies = useMemo(() => {
    let filtered = [...movies];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (movie) =>
          movie.title?.toLowerCase().includes(lowerSearch) ||
          movie.director?.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((movie) => movie.status === statusFilter);
    }

    return filtered;
  }, [movies, searchTerm, statusFilter]);

  // ✅ Memoize stats to prevent recalculation
  const stats = useMemo(() => {
    return {
      total: movies.length,
      nowShowing: movies.filter((m) => m.status === "now_showing").length,
      comingSoon: movies.filter((m) => m.status === "coming_soon").length,
    };
  }, [movies]);

  const handleAddMovie = useCallback(() => {
    setSelectedMovie(null);
    setShowMovieForm(true);
  }, []);

  const handleEditMovie = useCallback((movie) => {
    setSelectedMovie(movie);
    setShowMovieForm(true);
  }, []);

  const handleDeleteMovie = useCallback((movie) => {
    setMovieToDelete(movie);
    setShowDeleteDialog(true);
  }, []);

  const handleSubmitMovie = async (movieData) => {
    try {
      if (selectedMovie) {
        // ✅ Update existing movie
        const updated = await movieService.update(selectedMovie.id, movieData);

        // ✅ Recalculate status after update
        const updatedWithStatus = {
          ...updated,
          status: calculateMovieStatus(updated),
        };

        setMovies((prev) =>
          prev.map((m) => (m.id === selectedMovie.id ? updatedWithStatus : m))
        );

        message.success("Cập nhật phim thành công!");
      } else {
        // ✅ Add new movie
        const newMovie = await movieService.create(movieData);

        // ✅ Calculate status for new movie
        const newMovieWithStatus = {
          ...newMovie,
          status: calculateMovieStatus(newMovie),
        };

        setMovies((prev) => [...prev, newMovieWithStatus]);

        message.success("Thêm phim thành công!");
      }

      setShowMovieForm(false);
      setSelectedMovie(null);

      // ✅ Refresh data to ensure sync
      setTimeout(() => {
        fetchMovies();
      }, 500);
    } catch (error) {
      console.error("Error submitting movie:", error);
      message.error(error.message || "Có lỗi xảy ra!");
    }
  };

  const confirmDelete = async () => {
    try {
      await movieService.delete(movieToDelete.id);

      // ✅ Update local state
      setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));

      message.success("Xóa phim thành công!");
      setShowDeleteDialog(false);
      setMovieToDelete(null);

      // ✅ Force refresh to ensure backend sync
      setTimeout(() => {
        fetchMovies();
      }, 500);
    } catch (error) {
      console.error("Error deleting movie:", error);
      message.error(error.message || "Có lỗi xảy ra khi xóa phim!");
    }
  };

  const getStatusBadge = useCallback((status) => {
    const badges = {
      now_showing: { label: "Đang chiếu", className: "success" },
      coming_soon: { label: "Sắp chiếu", className: "info" },
      ended: { label: "Ngừng chiếu", className: "gray" },
    };

    const badge = badges[status] || badges.ended;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
  }, []);

  const ImageWithFallback = ({ src, alt, className }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setImgSrc(src);
      setHasError(false);
    }, [src]);

    const handleError = () => {
      if (!hasError) {
        setHasError(true);
        // ✅ Use a data URI as fallback to prevent network request
        setImgSrc(
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
        );
      }
    };

    return (
      <img src={imgSrc} alt={alt} className={className} onError={handleError} />
    );
  };

  if (loading) {
    return <Loading text="Đang tải danh sách phim..." />;
  }

  return (
    <div className="movies-page">
      <Breadcrumb />

      <div className="page-header">
        <h1>Quản lý phim</h1>
        <button onClick={handleAddMovie} className="btn primary">
          <FiPlus size={20} />
          Thêm phim mới
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Tổng số phim</p>
              <h3>{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Đang chiếu</p>
              <h3 style={{ color: "#10b981" }}>{stats.nowShowing}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Sắp chiếu</p>
              <h3 style={{ color: "#2563eb" }}>{stats.comingSoon}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-content">
          <div className="search-input">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phim, đạo diễn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="now_showing">Đang chiếu</option>
            <option value="coming_soon">Sắp chiếu</option>
            <option value="ended">Ngừng chiếu</option>
          </select>
        </div>
      </div>

      <div className="admin-table movie-table">
        {filteredMovies.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <ImageWithFallback
                      src={movie.poster}
                      alt={movie.title}
                      className="movie-poster"
                      onError={(e) => {
                        e.target.src = "/placeholder-poster.jpg";
                      }}
                    />
                  </td>
                  <td>
                    <div className="movie-info">
                      <p className="title">{movie.title}</p>
                      <p className="director">{movie.director}</p>
                    </div>
                  </td>
                  <td>{movie.genre}</td>
                  <td>{movie.duration} phút</td>
                  <td>{getStatusBadge(movie.status)}</td>
                  <td>
                    <div className="actions">
                      <button className="view" title="Xem lịch chiếu">
                        <FiCalendar size={18} />
                      </button>
                      <button
                        onClick={() => handleEditMovie(movie)}
                        className="edit"
                        title="Chỉnh sửa"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie)}
                        className="delete"
                        title="Xóa"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">Không tìm thấy phim nào</div>
        )}
      </div>

      {showMovieForm && (
        <MovieForm
          movie={selectedMovie}
          onClose={() => {
            setShowMovieForm(false);
            setSelectedMovie(null);
          }}
          onSubmit={handleSubmitMovie}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setMovieToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa phim"
        message={`Bạn có chắc chắn muốn xóa phim "${movieToDelete?.title}"? Hành động này không thể hoàn tác.`}
        type="danger"
      />
    </div>
  );
};

export default Movies;
