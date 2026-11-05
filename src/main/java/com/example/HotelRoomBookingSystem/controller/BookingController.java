package com.example.HotelRoomBookingSystem.controller;

import com.example.HotelRoomBookingSystem.dto.BookingRequest;
import com.example.HotelRoomBookingSystem.dto.BookingResponse;
import com.example.HotelRoomBookingSystem.entity.User;
import com.example.HotelRoomBookingSystem.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/booking")
public class BookingController {
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request, @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookingService.createBooking(request, email));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(bookingService.getMyBookings(email));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable String bookingId, @AuthenticationPrincipal String email) {
        bookingService.cancelBooking(bookingId, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/availability")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam String roomId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate checkIn,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate checkOut) {

        return ResponseEntity.ok(
                bookingService.isRoomAvailable(roomId, checkIn, checkOut)
        );
    }
}
