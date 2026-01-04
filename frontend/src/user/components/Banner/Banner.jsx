import { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import './Banner.scss';

const Banner = ({ movies }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const orderRef = useRef([0, 1, 2, 3, 4, 5]);
    const detailsEvenRef = useRef(true);
    const clicksRef = useRef(0);
    const loopTimeoutRef = useRef(null);

    const displayMovies = useMemo(() => {
        return movies?.slice(0, 6) || [];
    }, [movies]);

    useEffect(() => {
        if (!displayMovies.length || isInitialized) return;
        let isMounted = true;

        const initBanner = () => {
            const order = orderRef.current;
            const detailsEven = detailsEvenRef.current;
            const ease = "sine.inOut";

            const getCard = (index) => `#card${index}`;
            const getCardContent = (index) => `#card-content-${index}`;
            const getSliderItem = (index) => `#slide-item-${index}`;

            const containerHeight = window.innerHeight * 0.7;
            const { innerWidth: width } = window;
            const offsetTop = containerHeight - 370;
            const offsetLeft = width - 750;
            const cardWidth = 180;
            const cardHeight = 270;
            const gap = 40;
            const numberSize = 50;

            const [active, ...rest] = order;
            const detailsActive = detailsEven ? "#details-even" : "#details-odd";
            const detailsInactive = detailsEven ? "#details-odd" : "#details-even";

            gsap.set("#pagination", {
                top: offsetTop + 280,
                left: offsetLeft,
                y: 200,
                opacity: 0,
                zIndex: 60,
            });

            gsap.set(getCard(active), {
                x: 0,
                y: 0,
                width: width,
                height: containerHeight,
                onUpdate: () => {
                    gsap.set(getCard(active), { backgroundSize: 'cover', backgroundPosition: 'center' });
                }
            });
            gsap.set(getCardContent(active), { x: 0, y: 0, opacity: 0 });
            gsap.set(detailsActive, { opacity: 0, zIndex: 22, x: -200 });
            gsap.set(detailsInactive, { opacity: 0, zIndex: 12 });
            gsap.set(`${detailsInactive} .text`, { y: 100 });
            gsap.set(`${detailsInactive} .title-1`, { y: 100 });
            gsap.set(`${detailsInactive} .title-2`, { y: 100 });
            gsap.set(`${detailsInactive} .desc`, { y: 50 });
            gsap.set(`${detailsInactive} .cta`, { y: 60 });

            gsap.set(".progress-sub-foreground", {
                width: 400 * (1 / order.length) * (active + 1),
            });

            rest.forEach((i, index) => {
                gsap.set(getCard(i), {
                    x: offsetLeft + 400 + index * (cardWidth + gap),
                    y: offsetTop,
                    width: cardWidth,
                    height: cardHeight,
                    zIndex: 30,
                    borderRadius: 10,
                    onUpdate: () => {
                        gsap.set(getCard(i), { backgroundSize: 'cover', backgroundPosition: 'center' });
                    }
                });
                gsap.set(getCardContent(i), {
                    x: offsetLeft + 400 + index * (cardWidth + gap),
                    zIndex: 40,
                    y: offsetTop + cardHeight - 100,
                });
                gsap.set(getSliderItem(i), { x: (index + 1) * numberSize });
            });

            gsap.set(".indicator", { x: -width });
            gsap.set(".cover", { x: 0 });

            const startDelay = 0.6;

            gsap.to(".cover", {
                x: width + 400,
                delay: 0.5,
                ease,
                onComplete: () => {
                    setTimeout(() => {
                        startLoop();
                    }, 500);
                },
            });

            rest.forEach((i, index) => {
                gsap.to(getCard(i), {
                    x: offsetLeft + index * (cardWidth + gap),
                    zIndex: 30,
                    delay: startDelay + 0.05 * index,
                    ease,
                });
                gsap.to(getCardContent(i), {
                    x: offsetLeft + index * (cardWidth + gap),
                    zIndex: 40,
                    delay: startDelay + 0.05 * index,
                    ease,
                });
            });

            gsap.to("#pagination", { y: 0, opacity: 1, ease, delay: startDelay });
            gsap.to(detailsActive, { opacity: 1, x: 0, ease, delay: startDelay });
        };

        const step = () => {
            return new Promise((resolve) => {
                if (!isMounted) return resolve();

                orderRef.current.push(orderRef.current.shift());
                detailsEvenRef.current = !detailsEvenRef.current;

                const order = orderRef.current;
                const detailsEven = detailsEvenRef.current;
                const ease = "sine.inOut";

                const getCard = (index) => `#card${index}`;
                const getCardContent = (index) => `#card-content-${index}`;
                const getSliderItem = (index) => `#slide-item-${index}`;

                const containerHeight = window.innerHeight * 0.7;
                const { innerWidth: width } = window;
                const offsetTop = containerHeight - 370;
                const offsetLeft = width - 750;
                const cardWidth = 180;
                const cardHeight = 270;
                const gap = 40;
                const numberSize = 50;

                const detailsActive = detailsEven ? "#details-even" : "#details-odd";
                const detailsInactive = detailsEven ? "#details-odd" : "#details-even";

                const activeMovie = displayMovies[order[0]];


                const genreEl = document.querySelector(`${detailsActive} .place-box .text`);
                const title1El = document.querySelector(`${detailsActive} .title-1`);
                const title2El = document.querySelector(`${detailsActive} .title-2`);
                const descEl = document.querySelector(`${detailsActive} .desc`);

                if (!genreEl || !title1El || !title2El || !descEl) {
                    return resolve();
                }

                genreEl.textContent = activeMovie?.genre || '';
                title1El.textContent = activeMovie?.title?.split(' ').slice(0, 1).join(' ') || '';
                title2El.textContent = activeMovie?.title?.split(' ').slice(1).join(' ') || '';
                descEl.textContent = activeMovie?.description || '';

                gsap.set(detailsActive, { zIndex: 22 });
                gsap.to(detailsActive, { opacity: 1, delay: 0.4, ease });
                gsap.to(`${detailsActive} .text`, { y: 0, delay: 0.1, duration: 0.7, ease });
                gsap.to(`${detailsActive} .title-1`, { y: 0, delay: 0.15, duration: 0.7, ease });
                gsap.to(`${detailsActive} .title-2`, { y: 0, delay: 0.15, duration: 0.7, ease });
                gsap.to(`${detailsActive} .desc`, { y: 0, delay: 0.3, duration: 0.4, ease });
                gsap.to(`${detailsActive} .cta`, { y: 0, delay: 0.35, duration: 0.4, onComplete: resolve, ease });
                gsap.set(detailsInactive, { zIndex: 12 });

                const [active, ...rest] = order;
                const prv = rest[rest.length - 1];

                gsap.set(getCard(prv), { zIndex: 10 });
                gsap.set(getCard(active), { zIndex: 20 });
                gsap.to(getCard(prv), { scale: 1.5, ease });

                gsap.to(getCardContent(active), { y: offsetTop + cardHeight - 10, opacity: 0, duration: 0.3, ease });
                gsap.to(getSliderItem(active), { x: 0, ease });
                gsap.to(getSliderItem(prv), { x: -numberSize, ease });
                gsap.to(".progress-sub-foreground", { width: 400 * (1 / order.length) * (active + 1), ease });

                gsap.to(getCard(active), {
                    x: 0,
                    y: 0,
                    ease,
                    width: width,
                    height: containerHeight,
                    borderRadius: 0,
                    onUpdate: () => {
                        gsap.set(getCard(active), { backgroundSize: 'cover', backgroundPosition: 'center' });
                    },
                    onComplete: () => {
                        const xNew = offsetLeft + (rest.length - 1) * (cardWidth + gap);
                        gsap.set(getCard(prv), { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, zIndex: 30, borderRadius: 10, scale: 1 });
                        gsap.set(getCardContent(prv), { x: xNew, y: offsetTop + cardHeight - 100, opacity: 1, zIndex: 40 });
                        gsap.set(getSliderItem(prv), { x: rest.length * numberSize });

                        gsap.set(detailsInactive, { opacity: 0 });
                        gsap.set(`${detailsInactive} .text`, { y: 100 });
                        gsap.set(`${detailsInactive} .title-1`, { y: 100 });
                        gsap.set(`${detailsInactive} .title-2`, { y: 100 });
                        gsap.set(`${detailsInactive} .desc`, { y: 50 });
                        gsap.set(`${detailsInactive} .cta`, { y: 60 });

                        clicksRef.current -= 1;
                        if (clicksRef.current > 0) {
                            step();
                        }
                    },
                });

                rest.forEach((i, index) => {
                    if (i !== prv) {
                        const xNew = offsetLeft + index * (cardWidth + gap);
                        gsap.set(getCard(i), { zIndex: 30 });
                        gsap.to(getCard(i), {
                            x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, ease, delay: 0.1 * (index + 1), onUpdate: () => {
                                gsap.set(getCard(i), { backgroundSize: 'cover', backgroundPosition: 'center' });
                            }
                        });
                        gsap.to(getCardContent(i), { x: xNew, y: offsetTop + cardHeight - 100, opacity: 1, zIndex: 40, ease, delay: 0.1 * (index + 1) });
                        gsap.to(getSliderItem(i), { x: (index + 1) * numberSize, ease });
                    }
                });
            });
        };

        const startLoop = async () => {
            if (!isMounted) return;
            const { innerWidth: width } = window;
            await gsap.to(".indicator", { x: 0, duration: 2 });
            await gsap.to(".indicator", { x: width, duration: 0.8, delay: 0.3 });
            gsap.set(".indicator", { x: -width });
            await step();
            loopTimeoutRef.current = setTimeout(startLoop, 0);
        };

        initBanner();
        setIsInitialized(true);

        return () => {
            if (loopTimeoutRef.current) {
                clearTimeout(loopTimeoutRef.current);
            }
        };
    }, [displayMovies, isInitialized]);

    if (!displayMovies.length) {
        return <div className="banner-container">Loading...</div>;
    }

    return (
        <div className="banner-container">
            <div id="demo">
                {displayMovies.map((movie, index) => (
                    <div key={index}>
                        <div className="card" id={`card${index}`} style={{ backgroundImage: `url(${movie.poster})` }}></div>
                        <div className="card-content" id={`card-content-${index}`}>
                            <div className="content-start"></div>
                            <div className="content-place">{movie.genre}</div>
                            <div className="content-title-1">{movie.title.split(' ').slice(0, 1).join(' ')}</div>
                            <div className="content-title-2">{movie.title.split(' ').slice(1).join(' ')}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="details" id="details-even">
                <div className="place-box">
                    <div className="text">{displayMovies[0]?.genre}</div>
                </div>
                <div className="title-box-1"><div className="title-1">{displayMovies[0]?.title.split(' ').slice(0, 1).join(' ')}</div></div>
                <div className="title-box-2"><div className="title-2">{displayMovies[0]?.title.split(' ').slice(1).join(' ')}</div></div>
                <div className="desc">{displayMovies[0]?.description}</div>
            </div>

            <div className="details" id="details-odd">
                <div className="place-box">
                    <div className="text">{displayMovies[0]?.genre}</div>
                </div>
                <div className="title-box-1"><div className="title-1">{displayMovies[0]?.title.split(' ').slice(0, 1).join(' ')}</div></div>
                <div className="title-box-2"><div className="title-2">{displayMovies[0]?.title.split(' ').slice(1).join(' ')}</div></div>
                <div className="desc">{displayMovies[0]?.description}</div>
            </div>

            <div className="pagination" id="pagination">
                <div className="arrow arrow-left">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </div>
                <div className="arrow arrow-right">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </div>
                <div className="progress-sub-container">
                    <div className="progress-sub-background">
                        <div className="progress-sub-foreground"></div>
                    </div>
                </div>
                <div className="slide-numbers" id="slide-numbers">
                    {displayMovies.map((_, index) => (
                        <div key={index} className="item" id={`slide-item-${index}`}>{index + 1}</div>
                    ))}
                </div>
            </div>

            <div className="cover"></div>
        </div>
    );
};

export default Banner;