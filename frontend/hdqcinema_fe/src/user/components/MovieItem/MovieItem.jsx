import { Card, Button } from 'antd';
import { Link } from 'react-router-dom';
import './MovieItem.scss';

const MovieItem = ({ movie, setSelectedMovieId, cinemaId }) => {
    const isTitleOverflow = movie.title.length > 20;

    return (
        <div className="movieitem_container">
            <Card
                hoverable
                cover={<img alt={movie.title} src={movie.poster} />}
            >
                <Card.Meta
                    title={
                        isTitleOverflow ? (
                            <Link
                                to={`/movie-detail/${movie.movie_id}`}
                                state={{ cinema_id: cinemaId }}
                                className="movie-title marquee"
                            >
                                <span className="marquee-content">
                                    {movie.title}
                                    <span className="marquee-separator"> • </span>
                                    {movie.title}
                                </span>
                            </Link>
                        ) : (
                            <Link
                                to={`/movie-detail/${movie.movie_id}`}
                                state={{ cinema_id: cinemaId }}
                                className="movie-title"
                            >
                                {movie.title}
                            </Link>
                        )
                    }
                    description={
                        <div className="movie-info">
                            <ul>
                                <li><strong>Thể loại:</strong> {movie.genre || movie.genre.join(', ')}</li>
                                <li><strong>Thời lượng:</strong> {movie.duration} phút</li>
                            </ul>
                            <Button
                                type="primary"
                                size="large"
                                className="buy-button"
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
                        </div>
                    }
                />
            </Card>
        </div>
    );
}

export default MovieItem;