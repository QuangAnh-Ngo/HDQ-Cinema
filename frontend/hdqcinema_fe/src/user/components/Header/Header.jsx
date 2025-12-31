import { Layout, Menu, Cascader, Button, Input, Spin, List } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SearchOutlined, CloseCircleFilled } from "@ant-design/icons";
import "./Header.scss";
import logo from "../../../assets/images/HDQ-Cinema-logo.png";
import { useEffect, useState } from "react";
import { getCinemas, getMovies } from "../../services/api";

const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cinemas, setCinemas] = useState([]);
  const [user, setUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const data = await getCinemas();
        setCinemas(data);
      } catch (error) {
        console.error("Error fetching cinemas:", error);
        setCinemas([]);
      }
    };
    fetchCinemas();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const options = [];
  cinemas.forEach((c) => {
    let city = options.find((o) => o.value === c.city);
    if (!city) {
      city = { value: c.city, label: c.city, children: [] };
      options.push(city);
    }

    let district = city.children.find((o) => o.value === c.district);
    if (!district) {
      district = { value: c.district, label: c.district, children: [] };
      city.children.push(district);
    }

    district.children.push({
      value: c.cinema_id,
      label: c.name,
    });
  });

  const handleChange = (value) => {
    if (!value || value.length === 0) return;
    const cinemaId = value[value.length - 1];
    navigate("/", { state: { cinema_id: cinemaId } });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const fetchResults = async () => {
      setSearchLoading(true);
      try {
        const movies = await getMovies();
        const filtered = movies.filter((movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie-detail/${movieId}`);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <AntHeader className="header">
      <div className="header-container">
        <div className="wrap">
          <div className="logo">
            <Link to="/" state={{ cinema_id: location.state?.cinema_id }}>
              <img src={logo} alt="HDQ Cinema Logo" />
            </Link>
          </div>

          <Cascader
            options={options}
            onChange={handleChange}
            placeholder="Chọn rạp"
            className="cinema-cascader"
            displayRender={(labels) => labels[labels.length - 1]}
            allowClear={false}
          />

          {/* <nav className='menu'>
                        <Menu mode="horizontal" className='menu-list'>
                            <Menu.Item key="1"><Link to="#">Lịch chiếu theo rạp</Link></Menu.Item>
                            <Menu.Item key="2"><Link to="#">Phim</Link></Menu.Item>
                            <Menu.Item key="3"><Link to="#">Rạp</Link></Menu.Item>
                            <Menu.Item key="4"><Link to="#">Giá vé</Link></Menu.Item>
                            <Menu.Item key="5"><Link to="#">Thành viên</Link></Menu.Item>
                        </Menu>
                    </nav> */}

          <div className="header-search">
            <Input
              placeholder="Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              suffix={
                searchTerm && (
                  <CloseCircleFilled
                    onClick={handleClearSearch}
                    style={{ cursor: "pointer", color: "#999" }}
                  />
                )
              }
            />
            {searchTerm && (
              <div className="search-dropdown">
                <div className="search-header">Danh sách phim</div>
                {searchLoading ? (
                  <div className="search-loading">
                    <Spin size="small" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <List
                    dataSource={searchResults}
                    renderItem={(movie) => (
                      <List.Item
                        key={movie.movie_id}
                        onClick={() => handleMovieClick(movie.movie_id)}
                        className="search-item"
                      >
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="movie-poster"
                        />
                        <div className="movie-info">
                          <div className="movie-title">{movie.title}</div>
                          <div className="movie-meta">
                            <span className="movie-rating">
                              {movie.age_rating || "All-ages"}
                            </span>
                            <span className="movie-dot">•</span>
                            <span className="movie-year">
                              {movie.release_year || "Now"}
                            </span>
                            <span className="movie-dot">•</span>
                            <span className="movie-duration">
                              {movie.duration} phút
                            </span>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="no-results">Không tìm thấy phim nào</div>
                )}
              </div>
            )}
          </div>

          <div className="user-section">
            {user ? (
              <>
                <span className="username">👤{user.name}</span>
                <Button
                  type="link"
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                onClick={() => navigate("/login")}
                className="login-btn"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
