package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.SeatCreationRequest;
import com.example.HDQCinema.dto.response.SeatCreationResponse;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.entity.Seat;
import com.example.HDQCinema.enums.SeatType;
import com.example.HDQCinema.repository.RoomRepository;
import com.example.HDQCinema.repository.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SeatService Unit Tests")
class SeatServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private SeatService seatService;

    private SeatCreationRequest seatCreationRequest;
    private Room room;
    private String roomId;

    @BeforeEach
    void setUp() {
        roomId = "test-room-id-123";

        room = Room.builder()
                .id(roomId)
                .roomName("Phòng chiếu 1")
                .build();

        seatCreationRequest = SeatCreationRequest.builder()
                .roomId(roomId)
                .firstSeatRow('A')
                .lastSeatRow('C')
                .firstColumnSeatNumber(1)
                .lastColumnSeatNumber(5)
                .type("CLASSIC")
                .build();
    }

    @Test
    @DisplayName("Test create seats - thành công")
    void testCreateSeats_Success() {
        // Given
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(seatRepository.save(any(Seat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        SeatCreationResponse result = seatService.create(seatCreationRequest);

        // Then
        assertNotNull(result);
        assertEquals("success", result.getSeat());
        
        // Verify số lần save: 3 hàng (A, B, C) x 5 cột (1-5) = 15 ghế
        verify(seatRepository, times(15)).save(any(Seat.class));
        verify(roomRepository, times(1)).findById(roomId);
    }

    @Test
    @DisplayName("Test create seats - room không tồn tại")
    void testCreateSeats_RoomNotFound() {
        // Given
        when(roomRepository.findById(roomId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            seatService.create(seatCreationRequest);
        });

        assertEquals("Room not exist", exception.getMessage());
        verify(roomRepository, times(1)).findById(roomId);
        verify(seatRepository, never()).save(any(Seat.class));
    }

    @Test
    @DisplayName("Test create seats - kiểm tra thông tin ghế được tạo đúng")
    void testCreateSeats_VerifySeatDetails() {
        // Given
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        ArgumentCaptor<Seat> seatCaptor = ArgumentCaptor.forClass(Seat.class);
        when(seatRepository.save(any(Seat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        seatService.create(seatCreationRequest);

        // Then
        verify(seatRepository, times(15)).save(seatCaptor.capture());
        
        // Kiểm tra ghế đầu tiên (A1)
        Seat firstSeat = seatCaptor.getAllValues().get(0);
        assertEquals('A', firstSeat.getSeatRow());
        assertEquals(1, firstSeat.getSeatNumber());
        assertEquals(SeatType.CLASSIC, firstSeat.getSeatType());
        assertEquals(room, firstSeat.getRoom());

        // Kiểm tra ghế cuối cùng (C5)
        Seat lastSeat = seatCaptor.getAllValues().get(14);
        assertEquals('C', lastSeat.getSeatRow());
        assertEquals(5, lastSeat.getSeatNumber());
        assertEquals(SeatType.CLASSIC, lastSeat.getSeatType());
    }

    @Test
    @DisplayName("Test create seats - một hàng một cột")
    void testCreateSeats_SingleSeat() {
        // Given
        SeatCreationRequest singleSeatRequest = SeatCreationRequest.builder()
                .roomId(roomId)
                .firstSeatRow('A')
                .lastSeatRow('A')
                .firstColumnSeatNumber(1)
                .lastColumnSeatNumber(1)
                .type("VIP")
                .build();

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(seatRepository.save(any(Seat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        SeatCreationResponse result = seatService.create(singleSeatRequest);

        // Then
        assertNotNull(result);
        assertEquals("success", result.getSeat());
        verify(seatRepository, times(1)).save(any(Seat.class));
    }

    @Test
    @DisplayName("Test create seats - nhiều hàng nhiều cột")
    void testCreateSeats_MultipleRowsAndColumns() {
        // Given
        SeatCreationRequest largeRequest = SeatCreationRequest.builder()
                .roomId(roomId)
                .firstSeatRow('A')
                .lastSeatRow('E')
                .firstColumnSeatNumber(1)
                .lastColumnSeatNumber(10)
                .type("CLASSIC")
                .build();

        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(seatRepository.save(any(Seat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        seatService.create(largeRequest);

        // Then
        // 5 hàng (A-E) x 10 cột (1-10) = 50 ghế
        verify(seatRepository, times(50)).save(any(Seat.class));
    }
}

