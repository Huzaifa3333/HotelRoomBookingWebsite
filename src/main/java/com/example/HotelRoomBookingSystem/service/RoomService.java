package com.example.HotelRoomBookingSystem.service;

import com.example.HotelRoomBookingSystem.dto.RoomRequest;
import com.example.HotelRoomBookingSystem.dto.RoomResponse;
import com.example.HotelRoomBookingSystem.entity.Room;
import com.example.HotelRoomBookingSystem.entity.RoomStatus;
import com.example.HotelRoomBookingSystem.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository repository;

    public RoomResponse addRoom(RoomRequest request){
        if (repository.existsByRoomNumber(request.getRoomNumber())) {
            throw new RuntimeException("Room number already exists");
        }

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .description(request.getDescription())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .imageUrl(request.getImageUrl())
                .status(RoomStatus.AVAILABLE)
                .build();
        Room savedRoom = repository.save(room);
        return mapToResponse(savedRoom);
    }

    private RoomResponse mapToResponse(Room savedRoom) {
        RoomResponse response = new RoomResponse();
        response.setId(savedRoom.getId());
        response.setRoomNumber(savedRoom.getRoomNumber());
        response.setRoomType(savedRoom.getRoomType());
        response.setDescription(savedRoom.getDescription());
        response.setPricePerNight(savedRoom.getPricePerNight());
        response.setCapacity(savedRoom.getCapacity());
        response.setImageUrl(savedRoom.getImageUrl());
        response.setStatus(savedRoom.getStatus());
        response.setCreatedAt(savedRoom.getCreatedAt());
        response.setUpdatedAt(savedRoom.getUpdatedAt());
        return response;
    }

    public List<RoomResponse> getAllRooms(){
        List<Room> getRooms = repository.findAllOrderByRoomNumberAscending();
        if (getRooms.isEmpty()){
            throw new RuntimeException("No rooms found");
        }
        List<RoomResponse> rooms = new ArrayList<>();
        for(Room getroom : getRooms){
            RoomResponse response = mapToResponse(getroom);
            rooms.add(response);
        }
        return rooms;
    }

    public RoomResponse getRoomById(String id){
        Optional<Room> room =repository.findById(id);
        if (room.isEmpty()){
            throw new RuntimeException("Room Not Found");
        }
        return mapToResponse(room.get());
    }

    public RoomResponse updateRoom(String id, RoomRequest request) {

        Room room = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("No Room found"));

        if (!room.getRoomNumber().equals(request.getRoomNumber())
                && repository.existsByRoomNumber(request.getRoomNumber())) {
            throw new RuntimeException("Room number already exists");
        }

        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setDescription(request.getDescription());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setImageUrl(request.getImageUrl());
        if (request.getStatus() != null){
            room.setStatus(request.getStatus());
        }

        Room updatedRoom = repository.save(room);

        return mapToResponse(updatedRoom);
    }

    public void deleteRoom(String id){
        Optional<Room> room = repository.findById(id);
        if (room.isEmpty()){
            throw new RuntimeException("No Room found");
        }
         repository.delete(room.get());
    }
}
