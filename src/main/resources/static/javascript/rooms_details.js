
document.addEventListener("DOMContentLoaded", function () {

    const API_URL = "http://localhost:8080/api/rooms";
    const BOOKING_API_URL = "http://localhost:8080/api/booking";
    const ROOMS_PER_PAGE = 6;

    const roomsGrid = document.getElementById("roomsGrid");
    const pagination = document.querySelector(".rooms-pagination");
    const pageStatus = document.getElementById("roomsPageStatus");
    const availabilityForm = document.getElementById("availabilityForm");
    const availabilityMessage = document.getElementById("availabilityMessage");

    let allRooms = [];
    let filteredRooms = [];
    let currentPage = 1;

    // ==========================================
    // COMMON DATE HELPERS
    // ==========================================

    function getLocalDateString(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    const todayString = getLocalDateString(new Date());

    // ==========================================
    // LOAD ROOMS FROM THE DATABASE
    // ==========================================

    async function loadRooms() {

        if (!roomsGrid) return;

        try {

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Unable to load rooms");
            }

            const data = await response.json();

            allRooms = Array.isArray(data) ? data : [];
            filteredRooms = [...allRooms];

            if (allRooms.length === 0) {

                roomsGrid.textContent = "No room available";

                if (pagination) pagination.style.display = "none";

                if (pageStatus) {
                    pageStatus.textContent = "No rooms found.";
                }

                return;
            }

            renderRooms();

        } catch (error) {

            console.error("Rooms API Error:", error);

            roomsGrid.textContent =
                "Failed to load rooms. Please check the backend.";

            if (pagination) pagination.style.display = "none";

            if (pageStatus) {
                pageStatus.textContent = "Unable to load rooms.";
            }
        }
    }

    // ==========================================
    // 2. ROOM CARD BANANA
    // ==========================================

    function createRoomCard(room) {

        const card = document.createElement("article");
        card.className = "room-card";

        card.dataset.capacity = room.capacity ?? 2;
        card.dataset.roomId = room.id ?? "";
        card.style.cursor = "pointer";

        const imageContainer = document.createElement("div");
        imageContainer.className = "room-image";

        const image = document.createElement("img");
        image.src = room.imageUrl || "";
        image.alt = room.roomType || "Hotel Room";
        image.loading = "lazy";

        image.addEventListener("error", function () {
            image.alt = "Room image unavailable";
        });

        imageContainer.appendChild(image);

        const roomNumber = document.createElement("span");
        roomNumber.className = "room-number";

        roomNumber.textContent = room.roomNumber != null
            ? String(room.roomNumber).padStart(2, "0")
            : "--";

        imageContainer.appendChild(roomNumber);

        const info = document.createElement("div");
        info.className = "room-info";

        const type = document.createElement("span");
        type.className = "room-type";
        type.textContent = room.roomType || "HOTEL ROOM";

        const name = document.createElement("h3");
        name.textContent = room.roomType || "Hotel Room";

        const description = document.createElement("p");
        description.textContent =
            room.description || "Enjoy a comfortable stay at Elysian.";

        const meta = document.createElement("div");
        meta.className = "room-meta";

        const guests = document.createElement("span");
        const capacity = Number(room.capacity) || 2;

        guests.textContent =
            "♧ " + capacity + (capacity === 1 ? " Guest" : " Guests");

        const bed = document.createElement("span");
        bed.textContent = "Comfortable Bedding";

        meta.appendChild(guests);
        meta.appendChild(bed);

        const priceContainer = document.createElement("div");
        priceContainer.className = "room-price";

        const price = document.createElement("strong");
        const roomPrice = Number(room.pricePerNight) || 0;

        price.textContent = "PKR " + roomPrice.toLocaleString("en-PK");

        const perNight = document.createElement("span");
        perNight.textContent = "/ night";

        priceContainer.appendChild(price);
        priceContainer.appendChild(perNight);

        info.appendChild(type);
        info.appendChild(name);
        info.appendChild(description);
        info.appendChild(meta);
        info.appendChild(priceContainer);

        card.appendChild(imageContainer);
        card.appendChild(info);

        return card;
    }

    // ==========================================
    // 3. ROOMS DISPLAY AUR PAGINATION
    // ==========================================

    function renderRooms() {

        if (!roomsGrid) return;

        roomsGrid.replaceChildren();

        const totalRooms = filteredRooms.length;
        const totalPages = Math.ceil(totalRooms / ROOMS_PER_PAGE);

        if (totalRooms === 0) {

            roomsGrid.textContent =
                "No rooms match your search.";

            if (pagination) pagination.style.display = "none";

            if (pageStatus) {
                pageStatus.textContent = "No matching rooms found.";
            }

            return;
        }

        currentPage = Math.min(Math.max(currentPage, 1), totalPages);

        const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ROOMS_PER_PAGE, totalRooms);

        filteredRooms
            .slice(startIndex, endIndex)
            .forEach(function (room) {
                roomsGrid.appendChild(createRoomCard(room));
            });

        renderPagination(totalPages);

        if (pageStatus) {
            pageStatus.textContent =
                "Showing rooms " + (startIndex + 1) +
                "–" + endIndex + " of " + totalRooms;
        }
    }

    function renderPagination(totalPages) {

        if (!pagination) return;

        pagination.style.display = totalPages > 1 ? "flex" : "none";
        pagination.replaceChildren();

        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.textContent = "←";
        previousButton.setAttribute("aria-label", "Previous page");
        previousButton.disabled = currentPage === 1;

        previousButton.addEventListener("click", function () {
            if (currentPage > 1) {
                currentPage--;
                renderRooms();
            }
        });

        pagination.appendChild(previousButton);

        for (let page = 1; page <= totalPages; page++) {

            const button = document.createElement("button");
            button.type = "button";
            button.className = "page-button";
            button.textContent = page;

            if (page === currentPage) {
                button.classList.add("active");
                button.setAttribute("aria-current", "page");
            }

            button.addEventListener("click", function () {
                currentPage = page;
                renderRooms();
            });

            pagination.appendChild(button);
        }

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.textContent = "→";
        nextButton.setAttribute("aria-label", "Next page");
        nextButton.disabled = currentPage === totalPages;

        nextButton.addEventListener("click", function () {
            if (currentPage < totalPages) {
                currentPage++;
                renderRooms();
            }
        });

        pagination.appendChild(nextButton);
    }

    // ==========================================
    // 4. ROOM CARD CLICK
    // ==========================================

    if (roomsGrid) {

        roomsGrid.addEventListener("click", function (event) {

            const card = event.target.closest(".room-card");

            if (!card || !roomsGrid.contains(card)) return;

            const room = allRooms.find(function (item) {
                return String(item.id) === String(card.dataset.roomId);
            });

            if (!room) return;

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

            window.location.href = "rooms_details.html";
        });
    }

    // ==========================================
    // 5. AVAILABILITY SEARCH
    // ==========================================

    if (availabilityForm) {

        availabilityForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const checkin = document.getElementById("checkin");
            const checkout = document.getElementById("checkout");
            const guests = document.getElementById("guests");

            if (!checkin?.value || !checkout?.value || !guests) {

                if (availabilityMessage) {
                    availabilityMessage.textContent =
                        "Please select check-in and check-out dates.";
                }

                return;
            }

            if (checkout.value <= checkin.value) {

                if (availabilityMessage) {
                    availabilityMessage.textContent =
                        "Check-out date must be after check-in.";
                }

                return;
            }

            const requiredGuests = Number(guests.value);

            filteredRooms = allRooms.filter(function (room) {
                return Number(room.capacity) >= requiredGuests;
            });

            currentPage = 1;
            renderRooms();

            if (availabilityMessage) {
                availabilityMessage.textContent =
                    filteredRooms.length +
                    " room(s) match your guest capacity. " +
                    "Booking availability has not been checked.";
            }

            document.getElementById("rooms")?.scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    const searchCheckin = document.getElementById("checkin");
    const searchCheckout = document.getElementById("checkout");

    if (searchCheckin) searchCheckin.min = todayString;
    if (searchCheckout) searchCheckout.min = todayString;

    if (searchCheckin && searchCheckout) {

        searchCheckin.addEventListener("change", function () {

            if (!searchCheckin.value) return;

            const nextDay = new Date(searchCheckin.value + "T00:00:00");
            nextDay.setDate(nextDay.getDate() + 1);

            searchCheckout.min = getLocalDateString(nextDay);

            if (
                searchCheckout.value &&
                searchCheckout.value <= searchCheckin.value
            ) {
                searchCheckout.value = "";
            }
        });
    }

    // ==========================================
    // 6. ROOM DETAILS PAGE
    // ==========================================

    const detailRoomName = document.getElementById("detailRoomName");

    if (detailRoomName) {

        const savedRoom = sessionStorage.getItem("selectedRoom");

        if (!savedRoom) {
            window.location.href = "rooms.html";
            return;
        }

        try {

            const room = JSON.parse(savedRoom);

            const image = document.getElementById("detailRoomImage");
            const type = document.getElementById("detailRoomType");
            const description = document.getElementById("detailRoomDescription");
            const capacityElement = document.getElementById("detailRoomCapacity");
            const bed = document.getElementById("detailRoomBed");
            const price = document.getElementById("detailRoomPrice");

            if (image && room.image) {
                image.src = room.image;
                image.alt = room.name || "Hotel Room";
            }

            detailRoomName.textContent = room.name || "Hotel Room";

            if (type) type.textContent = room.type || "";
            if (description) description.textContent = room.description || "";

            if (capacityElement) {
                const capacity = Number(room.capacity) || 2;
                capacityElement.textContent =
                    capacity + (capacity === 1 ? " Guest" : " Guests");
            }

            if (bed) bed.textContent = room.bed || "Comfortable Bedding";

            if (price) {
                price.textContent =
                    (Number(room.price) || 0).toLocaleString("en-PK");
            }

            const guestsSelect = document.getElementById("bookingGuests");
            const checkin = document.getElementById("bookingCheckin");
            const checkout = document.getElementById("bookingCheckout");
            const total = document.getElementById("bookingTotal");
            const bookingForm = document.getElementById("roomBookingForm");
            const message = document.getElementById("bookingMessage");

            const bookingName = document.getElementById("bookingName");
            const bookingEmail = document.getElementById("bookingEmail");
            const bookingPhone = document.getElementById("bookingPhone");

            const roomCapacity = Number(room.capacity) || 2;

            // Guest capacity options

            if (guestsSelect) {

                Array.from(guestsSelect.options).forEach(function (option) {
                    if (option.value !== "") {
                        option.disabled = Number(option.value) > roomCapacity;
                    }
                });

                guestsSelect.value = roomCapacity >= 2 ? "2" : "1";
            }

            // Date minimums

            if (checkin) checkin.min = todayString;
            if (checkout) checkout.min = todayString;

            // Calculate total

            function calculateTotal() {

                if (!checkin || !checkout || !total) return;

                if (!checkin.value || !checkout.value) {
                    total.textContent = "PKR 0";
                    return;
                }

                const start = new Date(checkin.value + "T00:00:00");
                const end = new Date(checkout.value + "T00:00:00");

                const nights = Math.round(
                    (end.getTime() - start.getTime()) / 86400000
                );

                total.textContent = nights > 0
                    ? "PKR " + (
                        nights * (Number(room.price) || 0)
                    ).toLocaleString("en-PK")
                    : "PKR 0";
            }

            if (checkin && checkout) {

                checkin.addEventListener("change", function () {

                    if (checkin.value) {
                        const nextDay = new Date(checkin.value + "T00:00:00");
                        nextDay.setDate(nextDay.getDate() + 1);

                        checkout.min = getLocalDateString(nextDay);

                        if (
                            checkout.value &&
                            checkout.value <= checkin.value
                        ) {
                            checkout.value = "";
                        }
                    }

                    calculateTotal();
                });

                checkout.addEventListener("change", calculateTotal);
            }

            // Restore booking details after login

            const savedBooking = sessionStorage.getItem("pendingBooking");

            if (savedBooking) {

                try {

                    const booking = JSON.parse(savedBooking);

                    if (String(booking.roomId) === String(room.id)) {

                        if (bookingName) bookingName.value = booking.fullName || "";
                        if (bookingEmail) bookingEmail.value = booking.email || "";
                        if (bookingPhone) bookingPhone.value = booking.phone || "";

                        if (guestsSelect && booking.guests) {
                            guestsSelect.value = String(booking.guests);
                        }

                        if (checkin && booking.checkInDate) {
                            checkin.value = booking.checkInDate;
                        }

                        if (checkout && booking.checkOutDate) {
                            checkout.value = booking.checkOutDate;
                        }

                        if (checkin?.value && checkout) {
                            const nextDay = new Date(checkin.value + "T00:00:00");
                            nextDay.setDate(nextDay.getDate() + 1);
                            checkout.min = getLocalDateString(nextDay);
                        }
                    }

                } catch (error) {
                    console.error("Saved booking details error:", error);
                }
            }

            calculateTotal();

            // ==========================================
            // 7. SUBMIT BOOKING + CONFIRMATION REDIRECT
            // ==========================================

            if (bookingForm) {

                bookingForm.addEventListener("submit", async function (event) {

                    event.preventDefault();

                    if (
                        !checkin?.value ||
                        !checkout?.value ||
                        checkout.value <= checkin.value
                    ) {
                        if (message) {
                            message.textContent =
                                "Please select valid check-in and check-out dates.";
                        }
                        return;
                    }

                    if (checkin.value < todayString) {
                        if (message) {
                            message.textContent =
                                "Check-in date cannot be in the past.";
                        }
                        return;
                    }

                    const guests = guestsSelect
                        ? Number(guestsSelect.value)
                        : 1;

                    if (
                        !Number.isInteger(guests) ||
                        guests < 1 ||
                        guests > roomCapacity
                    ) {
                        if (message) {
                            message.textContent =
                                "Please select a valid number of guests.";
                        }
                        return;
                    }

                    if (!room.id) {
                        if (message) {
                            message.textContent =
                                "Room ID is missing. Please select the room again.";
                        }
                        return;
                    }

                    const bookingData = {
                        roomId: room.id,
                        checkInDate: checkin.value,
                        checkOutDate: checkout.value,
                        guests: guests,
                        fullName: bookingName ? bookingName.value : "",
                        email: bookingEmail ? bookingEmail.value : "",
                        phone: bookingPhone ? bookingPhone.value : ""
                    };

                    sessionStorage.setItem(
                        "pendingBooking",
                        JSON.stringify(bookingData)
                    );

                    const token = sessionStorage.getItem("userToken");

                    if (!token) {

                        sessionStorage.setItem(
                            "bookingReturnTo",
                            "rooms_details.html"
                        );

                        window.location.href = "admin-login.html?mode=user";
                        return;
                    }

                    const submitButton = bookingForm.querySelector(
                        'button[type="submit"]'
                    );

                    try {

                        if (submitButton) submitButton.disabled = true;

                        if (message) {
                            message.style.color = "";
                            message.textContent = "Submitting your booking...";
                        }

                        const response = await fetch(BOOKING_API_URL, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + token
                            },
                            body: JSON.stringify({
                                roomId: bookingData.roomId,
                                checkInDate: bookingData.checkInDate,
                                checkOutDate: bookingData.checkOutDate,
                                 phoneNumber: bookingData.phone,
                                 numberOfGuests: bookingData.guests
                            })
                        });

                        const result = await response.json().catch(function () {
                            return {};
                        });

                        if (response.status === 401 || response.status === 403) {

                            sessionStorage.removeItem("userToken");
                            sessionStorage.removeItem("userData");

                            sessionStorage.setItem(
                                "bookingReturnTo",
                                "rooms_details.html"
                            );

                            if (message) {
                                message.textContent =
                                    "Please sign in again to continue.";
                            }

                            window.location.href = "admin-login.html?mode=user";
                            return;
                        }

                        if (!response.ok) {
                            throw new Error(
                                result.message ||
                                result.error ||
                                "Booking failed. Please try again."
                            );
                        }

                        // Save actual backend response for confirmation page

                        const bookingReceipt = {
                            ...result,
                            roomNumber: result.roomNumber ?? room.roomNumber,
                            roomType: room.type || room.name || "Hotel Room",
                            guests: bookingData.guests,
                            checkInDate: result.checkInDate || bookingData.checkInDate,
                            checkOutDate: result.checkOutDate || bookingData.checkOutDate
                        };

                        sessionStorage.setItem(
                            "bookingReceipt",
                            JSON.stringify(bookingReceipt)
                        );

                        sessionStorage.removeItem("pendingBooking");
                        sessionStorage.removeItem("bookingReturnTo");

                        // Confirmation page is in the same pages folder

                        window.location.href = "bookingConfirmation.html";

                    } catch (error) {

                        console.error("Booking API Error:", error);

                        if (message) {
                            message.style.color = "#ff7777";
                            message.textContent =
                                error.message ||
                                "Unable to submit booking. Please try again.";
                        }

                    } finally {

                        if (submitButton) {
                            submitButton.disabled = false;
                        }
                    }
                });
            }

        } catch (error) {

            console.error("Selected room data error:", error);
            window.location.href = "rooms.html";
        }
    }

    // ==========================================
    // ROOMS LISTING PAGE
    // ==========================================

    if (roomsGrid) {
        loadRooms();
    }

});
