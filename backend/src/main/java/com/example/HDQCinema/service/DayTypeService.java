package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.DayTypeRequest;
import com.example.HDQCinema.dto.response.DayTypeResponse;
import com.example.HDQCinema.entity.DayType;
import com.example.HDQCinema.mapper.DayTypeMapper;
import com.example.HDQCinema.repository.DayTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DayTypeService {
    DayTypeRepository dayTypeRepository;
    DayTypeMapper dayTypeMapper;

    public DayTypeResponse create(DayTypeRequest request){
        var dayType = dayTypeMapper.toDayType(request);
        dayTypeRepository.save(dayType);

        return dayTypeMapper.toResponse(dayType);
    }
}
