package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.request.BookingRequest;
import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.entity.BookingDetail;
import com.example.HDQCinema.entity.Seat;
import com.example.HDQCinema.entity.ShowTime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface BookingMapper {
//    @Mapping(target = "seats", ignore = true)
//    @Mapping(target = "showTime", ignore = true)
//    BookingResponse toResponse(Booking booking);

    default List<String> toSeat(Booking booking) {
        if (booking == null) {
            return null;
        } else {
            List<String> seats = new ArrayList<>();
            for(BookingDetail detail : booking.getBookingDetails()){
                Seat seat = detail.getSeat();
                seats.add(""+seat.getSeatRow() + seat.getSeatNumber());
            }
            return seats;
        }
    }

    default BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        } else {
            BookingResponse.BookingResponseBuilder bookingResponse = BookingResponse.builder();
            bookingResponse.id(booking.getId());
            bookingResponse.totalPrice(booking.getTotalPrice());
            bookingResponse.createTime(booking.getCreateTime());
            bookingResponse.seats(toSeat(booking));
            bookingResponse.showTime(booking.getShowTime().getStartTime());
            return bookingResponse.build();
        }
    }

    Booking toBooking(BookingRequest request);
}
