package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.CinemaCreationRequest;
import com.example.HDQCinema.dto.response.CinemaResponse;
import com.example.HDQCinema.entity.Cinema;
import com.example.HDQCinema.entity.Room;
import com.example.HDQCinema.mapper.CinemaMapper;
import com.example.HDQCinema.mapper.RoomMapper;
import com.example.HDQCinema.repository.CinemaRepository;
import com.example.HDQCinema.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CinemaService Unit Tests")
class CinemaServiceTest {

    @Mock
    private CinemaRepository cinemaRepository;

    @Mock
    private CinemaMapper cinemaMapper;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMapper roomMapper;

    @InjectMocks
    private CinemaService cinemaService;

    private CinemaCreationRequest cinemaCreationRequest;
    private Cinema cinema;
    private CinemaResponse cinemaResponse;
    private String cinemaId;

    @BeforeEach
    void setUp() {
        cinemaId = "test-cinema-id-123";

        cinemaCreationRequest = new CinemaCreationRequest();
        cinemaCreationRequest.setName("HDQ Cinema Hà Nội");
        cinemaCreationRequest.setCity("Hà Nội");
        cinemaCreationRequest.setDistrict("Cầu Giấy");
        cinemaCreationRequest.setAddress("123 Đường ABC");

        cinema = Cinema.builder()
                .id(cinemaId)
                .name("HDQ Cinema Hà Nội")
                .city("Hà Nội")
                .district("Cầu Giấy")
                .address("123 Đường ABC")
                .build();

        cinemaResponse = new CinemaResponse();
        cinemaResponse.setId(cinemaId);
        cinemaResponse.setName("HDQ Cinema Hà Nội");
        cinemaResponse.setCity("Hà Nội");
        cinemaResponse.setDistrict("Cầu Giấy");
        cinemaResponse.setAddress("123 Đường ABC");
    }

    @Test
    @DisplayName("Test create cinema - thành công")
    void testCreateCinema_Success() {
        // Given
        when(cinemaMapper.toCinema(any(CinemaCreationRequest.class))).thenReturn(cinema);
        when(cinemaRepository.save(any(Cinema.class))).thenReturn(cinema);
        when(cinemaMapper.toResponse(any(Cinema.class))).thenReturn(cinemaResponse);

        // When
        CinemaResponse result = cinemaService.create(cinemaCreationRequest);

        // Then
        assertNotNull(result);
        assertEquals(cinemaId, result.getId());
        assertEquals("HDQ Cinema Hà Nội", result.getName());
        verify(cinemaMapper, times(1)).toCinema(cinemaCreationRequest);
        verify(cinemaRepository, times(1)).save(cinema);
        verify(cinemaMapper, times(1)).toResponse(cinema);
    }

    @Test
    @DisplayName("Test get cinema by id - thành công")
    void testGetCinemaById_Success() {
        // Given
        List<Room> rooms = new ArrayList<>();
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.of(cinema));
        when(cinemaMapper.toResponse(any(Cinema.class))).thenReturn(cinemaResponse);
        when(roomRepository.findRoomsByCinemaId(cinemaId)).thenReturn(rooms);
        when(roomMapper.toResponses(anyList())).thenReturn(new ArrayList<>());

        // When
        CinemaResponse result = cinemaService.get(cinemaId);

        // Then
        assertNotNull(result);
        assertEquals(cinemaId, result.getId());
        verify(cinemaRepository, times(1)).findById(cinemaId);
        verify(cinemaMapper, times(1)).toResponse(cinema);
        verify(roomRepository, times(1)).findRoomsByCinemaId(cinemaId);
    }

    @Test
    @DisplayName("Test get cinema by id - không tìm thấy")
    void testGetCinemaById_NotFound() {
        // Given
        when(cinemaRepository.findById(cinemaId)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cinemaService.get(cinemaId);
        });

        assertEquals("cinema not exist", exception.getMessage());
        verify(cinemaRepository, times(1)).findById(cinemaId);
        verify(cinemaMapper, never()).toResponse(any());
    }

    @Test
    @DisplayName("Test get cinema by id - input null")
    void testGetCinemaById_NullInput() {
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cinemaService.get(null);
        });

        assertEquals("invalid input", exception.getMessage());
        verify(cinemaRepository, never()).findById(anyString());
    }

    @Test
    @DisplayName("Test get cinema by id - input chứa SQL injection")
    void testGetCinemaById_SqlInjectionInput() {
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cinemaService.get("test--");
        });

        assertEquals("invalid input", exception.getMessage());
        verify(cinemaRepository, never()).findById(anyString());
    }

    @Test
    @DisplayName("Test get all cinemas - thành công")
    void testGetAllCinemas_Success() {
        // Given
        List<Cinema> cinemas = Arrays.asList(cinema, cinema);
        List<CinemaResponse> expectedResponses = Arrays.asList(cinemaResponse, cinemaResponse);
        
        when(cinemaRepository.findAll()).thenReturn(cinemas);
        when(cinemaMapper.toResponses(cinemas)).thenReturn(expectedResponses);

        // When
        List<CinemaResponse> result = cinemaService.getAll();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(cinemaRepository, times(1)).findAll();
        verify(cinemaMapper, times(1)).toResponses(cinemas);
    }

    @Test
    @DisplayName("Test get all cinemas - danh sách rỗng")
    void testGetAllCinemas_EmptyList() {
        // Given
        when(cinemaRepository.findAll()).thenReturn(Collections.emptyList());
        when(cinemaMapper.toResponses(anyList())).thenReturn(Collections.emptyList());

        // When
        List<CinemaResponse> result = cinemaService.getAll();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(cinemaRepository, times(1)).findAll();
    }
}

