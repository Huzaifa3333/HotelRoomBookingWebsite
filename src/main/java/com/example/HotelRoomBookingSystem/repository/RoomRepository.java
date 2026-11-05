package com.example.HotelRoomBookingSystem.repository;

import com.example.HotelRoomBookingSystem.entity.Room;
import com.example.HotelRoomBookingSystem.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room,String> {
    boolean existsByRoomNumber(String roomNumber);

    long countByStatus(RoomStatus roomStatus);

    @Query(value = "SELECT * FROM room ORDER BY CAST(room_number AS UNSIGNED) ASC", nativeQuery = true)
    List<Room> findAllOrderByRoomNumberAscending();
}
