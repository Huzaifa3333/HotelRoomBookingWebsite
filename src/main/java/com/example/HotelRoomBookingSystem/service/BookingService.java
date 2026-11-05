
package com.example.HotelRoomBookingSystem.service;

import com.example.HotelRoomBookingSystem.dto.BookingRequest;
import com.example.HotelRoomBookingSystem.dto.BookingResponse;
import com.example.HotelRoomBookingSystem.entity.Booking;
import com.example.HotelRoomBookingSystem.entity.BookingStatus;
import com.example.HotelRoomBookingSystem.entity.Room;
import com.example.HotelRoomBookingSystem.entity.User;
import com.example.HotelRoomBookingSystem.repository.BookingRepository;
import com.example.HotelRoomBookingSystem.repository.RoomRepository;
import com.example.HotelRoomBookingSystem.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String email) {

        LocalDate checkIn = request.getCheckInDate();
        LocalDate checkOut = request.getCheckOutDate();

        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException(
                    "Check-in and check-out dates are required");
        }

        if (!checkIn.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Check-in date must be in the future");
        }

        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException(
                    "Check-out must be after check-in");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found"));

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        boolean unavailable = bookingRepository.findAll().stream()
                .filter(b -> b.getRoom().getId().equals(room.getId()))
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .anyMatch(b ->
                        checkIn.isBefore(b.getCheckOutDate())
                                && checkOut.isAfter(b.getCheckInDate()));

        if (unavailable) {
            throw new IllegalArgumentException(
                    "Room is already booked for these dates");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        BigDecimal totalPrice = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .phoneNumber(request.getPhoneNumber())
                .numberOfGuests(request.getNumberOfGuests())
                .checkInDate(checkIn)
                .checkOutDate(checkOut)
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        return BookingResponse.builder()
                .guestName(savedBooking.getUser().getFullName())
                .email(savedBooking.getUser().getEmail())
                .phoneNumber(savedBooking.getPhoneNumber())
                .numberOfGuests(savedBooking.getNumberOfGuests())
                .id(savedBooking.getId())
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .checkInDate(savedBooking.getCheckInDate())
                .checkOutDate(savedBooking.getCheckOutDate())
                .totalPrice(savedBooking.getTotalPrice())
                .status(savedBooking.getStatus().name())
                .createdAt(savedBooking.getCreatedAt())
                .build();
    }

    public List<BookingResponse> getMyBookings(String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        return bookingRepository.findAll().stream()
                .filter(b -> b.getUser().getId().equals(user.getId()))
                .map(b -> BookingResponse.builder()
                        .id(b.getId())
                        .guestName(b.getUser().getFullName())
                        .email(b.getUser().getEmail())
                        .phoneNumber(b.getPhoneNumber())
                        .numberOfGuests(b.getNumberOfGuests())
                        .roomId(b.getRoom().getId())
                        .roomNumber(b.getRoom().getRoomNumber())
                        .checkInDate(b.getCheckInDate())
                        .checkOutDate(b.getCheckOutDate())
                        .totalPrice(b.getTotalPrice())
                        .status(b.getStatus().name())
                        .createdAt(b.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void cancelBooking(String bookingId, String email) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot cancel another user's booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException(
                    "Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        bookingRepository.save(booking);
    }

    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAll().stream()
                .map(b -> BookingResponse.builder()
                        .id(b.getId())
                        .guestName(b.getUser().getFullName())
                        .email(b.getUser().getEmail())
                        .phoneNumber(b.getPhoneNumber())
                        .numberOfGuests(b.getNumberOfGuests())
                        .roomId(b.getRoom().getId())
                        .roomNumber(b.getRoom().getRoomNumber())
                        .checkInDate(b.getCheckInDate())
                        .checkOutDate(b.getCheckOutDate())
                        .totalPrice(b.getTotalPrice())
                        .status(b.getStatus().name())
                        .createdAt(b.getCreatedAt())
                        .build())
                .toList();
    }

    public boolean isRoomAvailable(
            String roomId,
            LocalDate checkIn,
            LocalDate checkOut) {

        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException(
                    "Check-in and check-out dates are required");
        }

        if (!checkIn.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Check-in date must be in the future");
        }

        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException(
                    "Check-out must be after check-in");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Room not found"));

        boolean unavailable = bookingRepository.findAll().stream()
                .filter(b -> b.getRoom().getId().equals(room.getId()))
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .anyMatch(b ->
                        checkIn.isBefore(b.getCheckOutDate())
                                && checkOut.isAfter(b.getCheckInDate()));

        return !unavailable;
    }
}
