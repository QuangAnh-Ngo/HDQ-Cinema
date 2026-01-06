import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../services/movies";
import Breadcrumb from "../components/Common/Breadcrumb";
import Loading from "../components/Common/Loading";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import MovieForm from "../components/MovieForm";
import { toast } from "react-toastify";
import "../styles/MoviesPage.scss";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showMovieForm, setShowMovieForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, statusFilter]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      // Data trả về từ service có dạng { movies: [...] }
      setMovies(data.movies || []);
    } catch (error) {
      toast.error("Không thể lấy danh sách phim thực tế");
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    let filtered = [...movies];

    if (searchTerm) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movie.director.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((movie) => movie.status === statusFilter);
    }

    setFilteredMovies(filtered);
  };

  const handleAddMovie = () => {
    setSelectedMovie(null);
    setShowMovieForm(true);
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setShowMovieForm(true);
  };

  const handleDeleteMovie = (movie) => {
    setMovieToDelete(movie);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("Deleting movie:", movieToDelete.id);
      setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
      alert("Xóa phim thành công!");
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Có lỗi xảy ra khi xóa phim!");
    }
  };

  const handleSubmitMovie = async (movieData) => {
    try {
      if (selectedMovie) {
        console.log("Updating movie:", movieData);
        setMovies((prev) =>
          prev.map((m) =>
            m.id === selectedMovie.id ? { ...m, ...movieData } : m
          )
        );
        alert("Cập nhật phim thành công!");
      } else {
        const newMovie = {
          ...movieData,
          id: Date.now(),
        };
        console.log("Adding movie:", newMovie);
        setMovies((prev) => [...prev, newMovie]);
        alert("Thêm phim thành công!");
      }

      setShowMovieForm(false);
      setSelectedMovie(null);
    } catch (error) {
      console.error("Error submitting movie:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      now_showing: { label: "Đang chiếu", className: "success" },
      coming_soon: { label: "Sắp chiếu", className: "info" },
      ended: { label: "Ngừng chiếu", className: "gray" },
    };

    const badge = badges[status] || badges.ended;
    return <span className={`badge ${badge.className}`}>{badge.label}</span>;
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
              <h3>{movies.length}</h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Đang chiếu</p>
              <h3 style={{ color: "#10b981" }}>
                {movies.filter((m) => m.status === "now_showing").length}
              </h3>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p>Sắp chiếu</p>
              <h3 style={{ color: "#2563eb" }}>
                {movies.filter((m) => m.status === "coming_soon").length}
              </h3>
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
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="movie-poster"
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
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa phim"
        message={`Bạn có chắc chắn muốn xóa phim "${movieToDelete?.title}"? Hành động này không thể hoàn tác.`}
        type="danger"
      />
    </div>
  );
};

export default Movies;
