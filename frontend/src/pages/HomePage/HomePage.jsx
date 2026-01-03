import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs } from 'antd';
import MovieItem from '../../components/MovieItem/MovieItem';
import Banner from '../../components/Banner/Banner';
import './HomePage.scss';

const HomePage = ({ setSelectedMovieId }) => {
    const location = useLocation();
    const cinemaId = location.state?.cinema_id || null;

    const [movies, setMovies] = useState([]);
    const [activeTab, setActiveTab] = useState('showing');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch('http://localhost:3001/movies');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setMovies(data);
            } catch (error) {
                console.error('Error fetching movies:', error);
                setMovies([]);
            }
        };
        fetchMovies();
    }, []);

    const filteredMovies = movies.filter(movie => {
        const releaseDate = new Date(movie.day_start);
        const now = new Date("2025-10-23");
        if (activeTab === 'showing') return releaseDate < now;
        return releaseDate >= now;
    });

    return (
        <div className="main">
            <Banner
                movies={movies}
            />
            <div className="homepage-container">
                <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                    <Tabs.TabPane tab="Phim Sắp Chiếu" key="upcoming" />
                    <Tabs.TabPane tab="Phim Đang Chiếu" key="showing" />
                </Tabs>
                <div className="movie-list">
                    {filteredMovies.map(movie => (
                        <MovieItem
                            key={movie.movie_id}
                            movie={movie}
                            setSelectedMovieId={setSelectedMovieId}
                            cinemaId={cinemaId}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;