package com.example.HDQCinema.mapper;

import com.example.HDQCinema.dto.response.BookingResponse;
import com.example.HDQCinema.entity.Booking;
import com.example.HDQCinema.entity.BookingDetail;
import com.example.HDQCinema.entity.Seat;
import org.mapstruct.Mapper;

import java.util.ArrayList;
import java.util.List;

@Mapper(componentModel = "spring")
public interface BookingMapper {

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
            bookingResponse.bookingStatus(booking.getBookingStatus()); // Thêm bookingStatus
            bookingResponse.seats(toSeat(booking));

            // Thêm username từ member
            if (booking.getMember() != null) {
                String firstName = booking.getMember().getFirstName() != null ? booking.getMember().getFirstName() : "";
                String lastName = booking.getMember().getLastName() != null ? booking.getMember().getLastName() : "";
                bookingResponse.username((firstName + " " + lastName).trim());
            }

            return bookingResponse.build();
        }
    }

    List<BookingResponse> toResponses(List<Booking> bookings);
}
