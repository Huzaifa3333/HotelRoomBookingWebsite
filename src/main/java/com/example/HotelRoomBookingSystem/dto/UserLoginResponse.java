package com.example.HotelRoomBookingSystem.dto;

import com.example.HotelRoomBookingSystem.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private String id;
    private String fullName;
    private String email;
    private Role role;
    private String token;
}
