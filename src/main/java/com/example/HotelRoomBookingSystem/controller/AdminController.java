package com.example.HotelRoomBookingSystem.controller;

import com.example.HotelRoomBookingSystem.dto.AdminAuthResponse;
import com.example.HotelRoomBookingSystem.dto.AdminLoginReq;
import com.example.HotelRoomBookingSystem.dto.AdminRegReq;
import com.example.HotelRoomBookingSystem.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/register")
    public ResponseEntity<AdminAuthResponse> createAdmin(@Valid @RequestBody AdminRegReq regReq){
        return ResponseEntity.ok(adminService.registerAdmin(regReq));
    }

    @PostMapping("/login")
    public ResponseEntity<AdminAuthResponse> loginAdmin(@Valid @RequestBody AdminLoginReq loginReq){
        return ResponseEntity.ok(adminService.loginAdmin(loginReq));
    }
}
