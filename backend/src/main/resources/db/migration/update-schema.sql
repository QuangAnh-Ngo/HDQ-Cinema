CREATE TABLE booking_detail
(
    id          VARCHAR(255)     NOT NULL,
    price       DOUBLE PRECISION NOT NULL,
    seat_status VARCHAR(255),
    seat_id     VARCHAR(255)     NOT NULL,
    booking_id  VARCHAR(255)     NOT NULL,
    showtime_id VARCHAR(255)     NOT NULL,
    CONSTRAINT pk_booking_detail PRIMARY KEY (id)
);

ALTER TABLE booking_detail
    ADD CONSTRAINT uc_2786ed3671e7072a6b1bf3b8a UNIQUE (seat_id, showtime_id);

ALTER TABLE booking_detail
    ADD CONSTRAINT FK_BOOKING_DETAIL_ON_BOOKING FOREIGN KEY (booking_id) REFERENCES booking (booking_id);

ALTER TABLE booking_detail
    ADD CONSTRAINT FK_BOOKING_DETAIL_ON_SEAT FOREIGN KEY (seat_id) REFERENCES seat (seat_id);

ALTER TABLE booking_detail
    ADD CONSTRAINT FK_BOOKING_DETAIL_ON_SHOWTIME FOREIGN KEY (showtime_id) REFERENCES show_time (showtime_id);