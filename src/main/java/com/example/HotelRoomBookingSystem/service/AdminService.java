package com.example.HotelRoomBookingSystem.service;

import com.example.HotelRoomBookingSystem.config.JwtUtils;
import com.example.HotelRoomBookingSystem.dto.AdminAuthResponse;
import com.example.HotelRoomBookingSystem.dto.AdminLoginReq;
import com.example.HotelRoomBookingSystem.dto.AdminRegReq;
import com.example.HotelRoomBookingSystem.entity.Admin;
import com.example.HotelRoomBookingSystem.entity.Role;
import com.example.HotelRoomBookingSystem.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AdminAuthResponse registerAdmin(AdminRegReq request){
        if (adminRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email already registered");
        }
        Admin admin = Admin.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();
        Admin savedAdmin = adminRepository.save(admin);
        return mapToResponse(savedAdmin);
    }

    private AdminAuthResponse mapToResponse(Admin savedAdmin) {
        AdminAuthResponse response = new AdminAuthResponse();
        response.setId(savedAdmin.getId());
        response.setName(savedAdmin.getName());
        response.setEmail(savedAdmin.getEmail());
        response.setRole(savedAdmin.getRole());
        response.setToken(jwtUtils.generateToken(savedAdmin.getEmail(),savedAdmin.getRole()));
        return response;
    }

    public boolean existsByEmail(String email){
        return adminRepository.existsByEmail(email);
    }

    public AdminAuthResponse loginAdmin(AdminLoginReq request){
        Admin admin = adminRepository.findByEmail(request.getEmail());
        if (admin == null){
            throw new RuntimeException("Invalid Credentials");
        }
        if (!passwordEncoder.matches(request.getPassword(),admin.getPassword())){
            throw new RuntimeException("Invalid Credentials");
        }
        return mapToResponse(admin);
    }
}

