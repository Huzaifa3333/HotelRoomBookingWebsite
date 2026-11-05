package com.example.HotelRoomBookingSystem.repository;

import com.example.HotelRoomBookingSystem.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin,String> {
    boolean existsByEmail(String email);

    Admin findByEmail(String email);
}
