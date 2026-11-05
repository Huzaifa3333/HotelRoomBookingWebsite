package com.example.HotelRoomBookingSystem.service;

import com.example.HotelRoomBookingSystem.dto.DashboardStatsResponse;
import com.example.HotelRoomBookingSystem.entity.BookingStatus;
import com.example.HotelRoomBookingSystem.entity.RoomStatus;
import com.example.HotelRoomBookingSystem.repository.BookingRepository;
import com.example.HotelRoomBookingSystem.repository.RoomRepository;
import com.example.HotelRoomBookingSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getDashboardStats() {

        long totalRooms = roomRepository.count();

        long totalBookings = bookingRepository.count();


        long confirmedBookings =
                bookingRepository.countByStatus(BookingStatus.CONFIRMED);

        long cancelledBookings =
                bookingRepository.countByStatus(BookingStatus.CANCELLED);

        BigDecimal totalRevenue =
                bookingRepository.sumTotalPriceByStatus(
                        BookingStatus.CONFIRMED);

        long availableRooms = totalRooms - bookingRepository.countDistinctRoomsByStatus(BookingStatus.CONFIRMED);

        long totalGuests = userRepository.count();

        return DashboardStatsResponse.builder()
                .totalRooms(totalRooms)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .availableRooms(availableRooms)
                .totalRevenue(totalRevenue)
                .build();
    }
}
