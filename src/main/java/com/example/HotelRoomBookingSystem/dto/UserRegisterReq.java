package com.example.HotelRoomBookingSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegisterReq {
    private String fullName;
    private String email;
    private String password;
}
