package com.example.HotelRoomBookingSystem.controller;

import com.example.HotelRoomBookingSystem.dto.RoomRequest;
import com.example.HotelRoomBookingSystem.dto.RoomResponse;
import com.example.HotelRoomBookingSystem.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {
    private  final RoomService roomService;

    @PostMapping()
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request){
        return ResponseEntity.ok(roomService.addRoom(request));
    }

    @GetMapping()
    public ResponseEntity<List<RoomResponse>> getAllRooms(){
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String id){
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable String id,@RequestBody RoomRequest request){
        return ResponseEntity.ok(roomService.updateRoom(id,request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id){
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
