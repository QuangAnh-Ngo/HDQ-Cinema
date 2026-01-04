package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.request.ShowTimeUpdateRequest;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.mapper.ShowTimeMapper;
import com.example.HDQCinema.repository.MovieRepository;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.ShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ShowTimeService {
    ShowTimeRepository showTimeRepository;
    ShowTimeMapper showTimeMapper;
    RoomRepository roomRepository;
    MovieRepository movieRepository;

    public List<ShowTimeResponse> create(ShowTimeRequest request){
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(()-> new RuntimeException("movie not exist"));
        List<ShowTime> showTimes = new ArrayList<>();

        for(var showTimeRoom : request.getShowTimeRooms()){
            Room room = roomRepository.findById(showTimeRoom.getRoomId())
                    .orElseThrow(()-> new RuntimeException("room not exist"));

//            if(showTimeRepository.existsShowTimeByRoomAndStartTime(room, showTimeRoom.getShowTime()))
//                throw new RuntimeException("showtime existed");

            ShowTime showTime = showTimeMapper.toShowTime(movie, room, showTimeRoom.getShowTime());
            showTimes.add(showTime);
//            List<BookingSeat> bookingSeats = bookingSeatService.create(showTime);
//            showTime.setBookingSeats(new HashSet<>(bookingSeats));
            showTimeRepository.save(showTime);

        }

        return showTimeMapper.toResponses(showTimes);

    }

    public ShowTimeResponse update(String showtimeId, ShowTimeUpdateRequest request){
        ShowTime showTime = showTimeRepository.findShowTimesById(showtimeId);

        Movie movie = null;
        if(request.getMovieId() !=null){
            movie = movieRepository.findById(request.getMovieId())
                    .orElseThrow(()-> new RuntimeException("movie not exist"));
            showTime.setMovie(movie);

        }
        if (request.getShowTimeRooms() != null && !request.getShowTimeRooms().isEmpty()) {
            for(var showTimeRoom : request.getShowTimeRooms()){
                if(!showTimeRoom.getRoomId().isEmpty()) {
                    Room room = roomRepository.findById(showTimeRoom.getRoomId())
                            .orElseThrow(() -> new RuntimeException("room not exist"));

//            if(showTimeRepository.existsShowTimeByRoomAndStartTime(room, showTimeRoom.getShowTime()))
//                throw new RuntimeException("showtime existed");
                    showTime.setRoom(room);
                }
                if(!showTimeRoom.getShowTime().toString().isEmpty()) showTime.setStartTime(showTimeRoom.getShowTime());
//            List<BookingSeat> bookingSeats = bookingSeatService.create(showTime);
//            showTime.setBookingSeats(new HashSet<>(bookingSeats));

            }
        }


//            List<BookingSeat> bookingSeats = bookingSeatService.create(showTime);
//            showTime.setBookingSeats(new HashSet<>(bookingSeats));
            showTimeRepository.save(showTime);

        return showTimeMapper.toResponse(showTime);
    }
    public void delete(String showtimeId){
        showTimeRepository.deleteById(showtimeId);
    }

    public List<ShowTimeResponse> getAll(){
        return showTimeMapper.toResponses(showTimeRepository.findAll());
    }
}
