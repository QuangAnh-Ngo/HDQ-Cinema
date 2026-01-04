package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.query.SeatPerShowTimeDTO;
import com.example.HDQCinema.dto.request.RoomRequest;
import com.example.HDQCinema.dto.response.RoomForShowTimeResponse;
import com.example.HDQCinema.dto.response.RoomResponse;
import com.example.HDQCinema.entity.*;
import com.example.HDQCinema.enums.SeatStatus;
import com.example.HDQCinema.enums.SeatType;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.mapper.RoomMapper;
import com.example.HDQCinema.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoomService Unit Tests")
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMapper roomMapper;

    @Mock
    private CinemaRepository cinemaRepository;

    @Mock
    private ShowTimeRepository showTimeRepository;

    @Mock
    private BookingDetailRepository bookingDetailRepository;

    @Mock
    private TicketPriceRepository ticketPriceRepository;

    @InjectMocks
    private RoomService roomService;

    private RoomRequest roomRequest;
    private Cinema cinema;
    private Room room;
    private ShowTime showTime;
    private String cinemaId;
    private String roomId;
    private String showTimeId;

    @BeforeEach
    void setUp() {
        cinemaId = "cinema-id-123";
        roomId = "room-id-123";
        showTimeId = "showtime-id-123";

        cinema = Cinema.builder()
                .id(cinemaId)
                .name("HDQ Cinema")
                .build();

        room = Room.builder()
                .id(roomId)
                .roomName("Phòng chiếu 1")
                .cinema(cinema)
                .build();

        Movie movie = Movie.builder()
                .id("movie-id-123")
                .title("Test Movie")
                .build();

        showTime = ShowTime.builder()
                .id(showTimeId)
                .startTime(LocalDateTime.now().plusDays(1))
                .room(room)
                .movie(movie)
                .build();

        roomRequest = new RoomRequest();
        roomRequest.setRoomName("Phòng chiếu 1");
        roomRequest.setCinemaId(cinemaId);
    }

    @Test
    @DisplayName("Test create room - thành công")
    void testCreateRoom_Success() {
        // Given
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.of(cinema));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> {
            Room r = invocation.getArgument(0);
            r.setId(roomId);
            return r;
        });

        RoomResponse roomResponse = RoomResponse.builder()
                .roomId(roomId)
                .roomName("Phòng chiếu 1")
                .cinemaName("HDQ Cinema")
                .build();
        when(roomMapper.toResponse(any(Room.class))).thenReturn(roomResponse);

        // When
        RoomResponse result = roomService.create(roomRequest);

        // Then
        assertNotNull(result);
        assertEquals("Phòng chiếu 1", result.getRoomName());
        assertEquals("HDQ Cinema", result.getCinemaName());
        verify(cinemaRepository, times(1)).findById(cinemaId);
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    @DisplayName("Test create room - cinema không tồn tại")
    void testCreateRoom_CinemaNotFound() {
        // Given
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            roomService.create(roomRequest);
        });

        assertEquals("Cinema not found", exception.getMessage());
        verify(cinemaRepository, times(1)).findById(cinemaId);
        verify(roomRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test get room by showtime - thành công")
    void testGetRoomByShowTime_Success() {
        // Given
        when(showTimeRepository.findById(showTimeId)).thenReturn(Optional.of(showTime));

        SeatPerShowTimeDTO seatDTO1 = SeatPerShowTimeDTO.builder()
                .seatId("seat-1")
                .seatName("A1")
                .seatType(SeatType.CLASSIC)
                .seatStatus(SeatStatus.AVAILABLE)
                .price(100000.0)
                .build();

        SeatPerShowTimeDTO seatDTO2 = SeatPerShowTimeDTO.builder()
                .seatId("seat-2")
                .seatName("A2")
                .seatType(SeatType.VIP)
                .seatStatus(SeatStatus.HELD)
                .price(150000.0)
                .build();

        List<SeatPerShowTimeDTO> seats = Arrays.asList(seatDTO2, seatDTO1); // Unsorted
        when(roomRepository.getSeatPerShowTimeDTO(showTimeId)).thenReturn(seats);

        // When
        RoomForShowTimeResponse result = roomService.get(showTimeId);

        // Then
        assertNotNull(result);
        assertEquals(roomId, result.getRoomId());
        assertEquals(showTimeId, result.getShowtimeId());
        assertEquals("Phòng chiếu 1", result.getRoomName());
        assertEquals("HDQ Cinema", result.getCinemaName());
        assertEquals(2, result.getSeats().size());
        // Verify seats are sorted
        assertEquals("A1", result.getSeats().get(0).getSeatName());
        assertEquals("A2", result.getSeats().get(1).getSeatName());
        verify(showTimeRepository, times(1)).findById(showTimeId);
        verify(roomRepository, times(1)).getSeatPerShowTimeDTO(showTimeId);
    }

    @Test
    @DisplayName("Test get room by showtime - showtime không tồn tại")
    void testGetRoomByShowTime_ShowTimeNotFound() {
        // Given
        when(showTimeRepository.findById(showTimeId)).thenReturn(Optional.empty());

        // When & Then
        AppException exception = assertThrows(AppException.class, () -> {
            roomService.get(showTimeId);
        });

        assertEquals(ErrorCode.SHOWTIME_NOT_EXISTED, exception.getErrorCode());
        verify(showTimeRepository, times(1)).findById(showTimeId);
        verify(roomRepository, never()).getSeatPerShowTimeDTO(anyString());
    }
}

