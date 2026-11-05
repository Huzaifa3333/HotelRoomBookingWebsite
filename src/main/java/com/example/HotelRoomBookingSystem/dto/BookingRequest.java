package com.example.HotelRoomBookingSystem.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Future;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull
    private String roomId;

    @NotNull
    @Future
    private LocalDate checkInDate;

    @NotNull
    @Future
    private LocalDate checkOutDate;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotNull(message = "Number of guests is required")
    @Min(value = 1,message = "At least one guest is required")
    private Integer numberOfGuests;
}
