package com.example.HotelRoomBookingSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    private long totalRooms;

    private long totalBookings;

    private long confirmedBookings;

    private long cancelledBookings;

    private BigDecimal totalRevenue;

    private long availableRooms;
    private long totalGuests;
}
