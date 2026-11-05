package com.example.HotelRoomBookingSystem.dto;

import com.example.HotelRoomBookingSystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuthResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String token;
}
