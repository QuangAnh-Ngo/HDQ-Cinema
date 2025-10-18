package com.example.HDQCinema.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PaymentResponse implements Serializable { // Serializable = có thể đóng gói đối tượng thành bytes và khôi phục lại sau

    String status;
    String message;
    String URL;
}
