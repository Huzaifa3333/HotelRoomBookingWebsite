package com.example.HotelRoomBookingSystem.repository;

import com.example.HotelRoomBookingSystem.entity.Booking;
import com.example.HotelRoomBookingSystem.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface BookingRepository extends JpaRepository<Booking,String> {
    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status = :status")
    BigDecimal sumTotalPriceByStatus(@Param("status") BookingStatus status);

    long countDistinctRoomsByStatus(BookingStatus bookingStatus);
}
