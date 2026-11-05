package com.example.HotelRoomBookingSystem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
public class Booking{
        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private String id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false)
        private User user;

         @Column(nullable = false)
         private String phoneNumber;

         @Column(nullable = false)
         private Integer numberOfGuests;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "room_id", nullable = false)
        private Room room;

        @Column(nullable = false)
        private LocalDate checkInDate;

        @Column(nullable = false)
        private LocalDate checkOutDate;

        @Column(nullable = false, precision = 10, scale = 2)
        private BigDecimal totalPrice;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private BookingStatus status;

        @CreationTimestamp
        @Column(nullable = false, updatable = false)
        private LocalDateTime createdAt;


        @PrePersist
        protected void onCreate() {
            if (status == null) {
                status = BookingStatus.CONFIRMED;
            }
        }
}
