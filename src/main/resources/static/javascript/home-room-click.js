
document.addEventListener("DOMContentLoaded", function () {

    const roomCards = document.querySelectorAll(
        ".featured-rooms .room-card"
    );

    const API_URL = "http://localhost:8080/api/rooms";

    roomCards.forEach(function (card) {

        card.addEventListener("click", async function (event) {

            event.preventDefault();

            const roomTitle = card.querySelector("h3");

            if (!roomTitle) return;

            const selectedType = roomTitle.textContent.trim();

            try {

                const response = await fetch(API_URL);

                if (!response.ok) {
                    throw new Error("Failed to load rooms.");
                }

                const rooms = await response.json();

                const room = rooms.find(function (item) {
                    return item.roomType &&
                        item.roomType.trim().toLowerCase() ===
                        selectedType.toLowerCase();
                });

                if (!room) {
                    alert(
                        selectedType +
                        " was not found in the database. Please check the room type."
                    );
                    return;
                }

                const selectedRoom = {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    image: room.imageUrl || "",
                    name: room.roomType || "Hotel Room",
                    type: room.roomType || "",
                    description: room.description || "",
                    capacity: room.capacity ?? 2,
                    bed: "Comfortable Bedding",
                    price: Number(room.pricePerNight) || 0
                };

                sessionStorage.setItem(
                    "selectedRoom",
                    JSON.stringify(selectedRoom)
                );

                window.location.href = "pages/rooms_details.html";

            } catch (error) {

                console.error("Room selection error:", error);

                alert(
                    "Failed to load room details. Please check the backend."
                );
            }
        });

    });

});
