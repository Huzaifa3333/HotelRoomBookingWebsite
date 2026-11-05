package com.example.HotelRoomBookingSystem.controller;

import com.example.HotelRoomBookingSystem.dto.UserLoginRequest;
import com.example.HotelRoomBookingSystem.dto.UserLoginResponse;
import com.example.HotelRoomBookingSystem.dto.UserRegisterReq;
import com.example.HotelRoomBookingSystem.dto.UserResponse;
import com.example.HotelRoomBookingSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody UserRegisterReq request){
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(@RequestBody UserLoginRequest request){
        return ResponseEntity.ok(userService.loginUser(request));
    }


}
