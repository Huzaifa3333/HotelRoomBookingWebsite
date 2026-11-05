package com.example.HotelRoomBookingSystem.service;

import com.example.HotelRoomBookingSystem.config.JwtUtils;
import com.example.HotelRoomBookingSystem.dto.UserLoginRequest;
import com.example.HotelRoomBookingSystem.dto.UserLoginResponse;
import com.example.HotelRoomBookingSystem.dto.UserRegisterReq;
import com.example.HotelRoomBookingSystem.dto.UserResponse;
import com.example.HotelRoomBookingSystem.entity.Role;
import com.example.HotelRoomBookingSystem.entity.User;
import com.example.HotelRoomBookingSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserResponse registerUser(UserRegisterReq request){
        if (userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("User already exists");
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    public UserResponse mapToResponse(User savedUser) {
        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setFullName(savedUser.getFullName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setCreatedAt(savedUser.getCreatedAt());
        response.setUpdatedAt(savedUser.getUpdatedAt());
        return response;
    }
    public boolean existsByEmail(String email){
        return userRepository.existsByEmail(email);
    }

    public UserLoginResponse loginUser(UserLoginRequest request){
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null){
            throw new RuntimeException("Invalid Credentials");
        }
        if (!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new RuntimeException("Invalid Credentials");
        }
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());

        UserLoginResponse response = new UserLoginResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setToken(token);
        return response;
    }
}
