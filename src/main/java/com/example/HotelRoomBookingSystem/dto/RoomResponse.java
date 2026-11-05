package com.example.HotelRoomBookingSystem.dto;

import com.example.HotelRoomBookingSystem.entity.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private String id;
    private String roomNumber;
    private String roomType;
    private String description;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private String imageUrl;
    private RoomStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
