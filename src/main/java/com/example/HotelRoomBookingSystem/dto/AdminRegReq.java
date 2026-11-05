package com.example.HotelRoomBookingSystem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminRegReq {
    private String name;
    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&*!()]).{8,}$",
            message = "Password must contain uppercase, lowercase, number, special character and minimum 8 characters"
    )
    @NotBlank(message = "Password is required")
    private String password;
}
