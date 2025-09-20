package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.ShowTimeRequest;
import com.example.HDQCinema.dto.response.ShowTimeResponse;
import com.example.HDQCinema.entity.ShowTime;
import com.example.HDQCinema.mapper.ShowTimeMapper;
import com.example.HDQCinema.repository.ShowTimeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowTimeService {
    ShowTimeRepository showTimeRepository;
    ShowTimeMapper showTimeMapper;

//    public List<ShowTimeResponse> create(ShowTimeRequest request){
//
//        var showTimes = showTimeRepository.findByStartTimeIn(request.getStartTime());
//
//        showTimes = showTimeRepository.saveAll(showTimes);
//        return showTimeMapper.toResponses(showTimes);
//    }
}
