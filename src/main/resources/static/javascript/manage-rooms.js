
// ============================================
// ELYSIAN HOTEL & STAY
// ROOM MANAGEMENT
// ============================================


// ==================== API CONFIGURATION ====================

const API_BASE_URL = "http://localhost:8080";

const ROOMS_API_URL = `${API_BASE_URL}/api/rooms`;
const BOOKINGS_API_URL = `${API_BASE_URL}/api/booking/all`;

let allRooms = [];
let allBookings = [];


// ==================== DOM ELEMENTS ====================

const roomsTableBody = document.getElementById("roomsTableBody");
const roomSearch = document.getElementById("roomSearch");
const roomStatusFilter = document.getElementById("roomStatusFilter");

const roomFormSection = document.getElementById("roomFormSection");
const roomForm = document.getElementById("roomForm");
const roomFormTitle = document.getElementById("roomFormTitle");
const roomFormMessage = document.getElementById("roomFormMessage");

const roomHistoryModal = document.getElementById("roomHistoryModal");
const roomHistoryBody = document.getElementById("roomHistoryBody");


// ==================== AUTHENTICATION ====================

function checkAdminAuthentication() {

    const token = sessionStorage.getItem("adminToken");
    const adminData = sessionStorage.getItem("adminData");

    if (!token || !adminData) {
        window.location.href = "admin-login.html?mode=admin";
        return false;
    }

    return true;
}


// ==================== API REQUEST ====================

async function apiRequest(url, options = {}) {

    const token = sessionStorage.getItem("adminToken");

    const response = await fetch(url, {
        ...options,

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...options.headers
        }
    });

    if (response.status === 401 || response.status === 403) {
        console.error("Manage Rooms API Error:", response.status);
        throw new Error(`Access denied: ${response.status}`);
    }

    if (!response.ok) {

        let errorMessage = "Something went wrong.";

        try {

            const errorData = await response.json();

            errorMessage =
                errorData.message ||
                errorData.error ||
                errorData.detail ||
                errorMessage;

        } catch (error) {

            errorMessage = await response.text() || errorMessage;
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }

    return null;
}


// ==================== HELPER FUNCTIONS ====================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


function formatPrice(price) {

    return Number(price || 0).toLocaleString("en-PK", {
        maximumFractionDigits: 2
    });
}


function formatDate(dateValue) {

    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getLocalDateString(date = new Date()) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getToday() {
    return getLocalDateString();
}


function getBookingStatus(booking) {

    return String(booking.status || "").toUpperCase();
}


function isConfirmedBooking(booking) {

    return getBookingStatus(booking) === "CONFIRMED";
}


function isCancelledBooking(booking) {

    return getBookingStatus(booking) === "CANCELLED";
}


function getRoomBookings(roomId) {

    return allBookings.filter(booking =>
        String(booking.roomId) === String(roomId)
    );
}


// ==================== ROOM BOOKING HELPERS ====================

function getLatestRoomBooking(roomId) {

    const roomBookings = getRoomBookings(roomId);

    if (roomBookings.length === 0) {
        return null;
    }

    return [...roomBookings].sort((a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
}


function getLastCheckoutBooking(roomId) {

    const today = getToday();

    const completedBookings = getRoomBookings(roomId)
        .filter(booking => {

            return isConfirmedBooking(booking) &&
                booking.checkOutDate &&
                booking.checkOutDate <= today;

        });

    if (completedBookings.length === 0) {
        return null;
    }

    return completedBookings.sort((a, b) =>
        b.checkOutDate.localeCompare(a.checkOutDate)
    )[0];
}


// ==================== ROOM STATUS LOGIC ====================

function getRoomDisplayStatus(room) {

    const actualStatus = String(room.status || "AVAILABLE").toUpperCase();

    // Maintenance has the highest priority
    if (actualStatus === "MAINTENANCE") {
        return "MAINTENANCE";
    }

    const today = getToday();

    const roomBookings = getRoomBookings(room.id)
        .filter(isConfirmedBooking);

    // Currently occupied by a guest
    const activeBooking = roomBookings.find(booking => {

        return booking.checkInDate <= today &&
            booking.checkOutDate > today;

    });

    if (activeBooking) {
        return "OCCUPIED";
    }

    // Reserved for a future date
    const upcomingBooking = roomBookings.find(booking => {

        return booking.checkInDate > today &&
            booking.checkOutDate > today;

    });

    if (upcomingBooking) {
        return "BOOKED";
    }

    return "AVAILABLE";
}


// ==================== STATUS BADGES ====================

function getStatusBadge(status) {

    const statusClasses = {

        AVAILABLE: "status-available",
        BOOKED: "status-booked",
        OCCUPIED: "status-occupied",
        MAINTENANCE: "status-maintenance",
        CHECKED_OUT: "status-checked-out",
        CONFIRMED: "status-confirmed",
        CANCELLED: "status-cancelled"

    };

    const labels = {

        AVAILABLE: "Available",
        BOOKED: "Booked",
        OCCUPIED: "Occupied",
        MAINTENANCE: "Maintenance",
        CHECKED_OUT: "Checked Out",
        CONFIRMED: "Confirmed",
        CANCELLED: "Cancelled"

    };

    const cssClass = statusClasses[status] || "status-maintenance";
    const label = labels[status] || status;

    return `
        <span class="status-badge ${cssClass}">
            ${escapeHTML(label)}
        </span>
    `;
}


// ==================== LOAD ROOMS AND BOOKINGS ====================

async function loadRoomManagementData() {

    roomsTableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Loading room information...</span>
            </td>
        </tr>
    `;

    try {

        const [rooms, bookings] = await Promise.all([

            apiRequest(ROOMS_API_URL),
            apiRequest(BOOKINGS_API_URL)

        ]);

        if (!Array.isArray(rooms)) {
            throw new Error("Rooms response is not a valid list.");
        }

        if (!Array.isArray(bookings)) {
            throw new Error("Bookings response is not a valid list.");
        }

        allRooms = rooms;
        allBookings = bookings;

        updateRoomStatistics();
        renderRooms();

    } catch (error) {

        console.error("Room data loading error:", error);

        roomsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>${escapeHTML(error.message)}</span>
                </td>
            </tr>
        `;
    }
}


// ==================== ROOM STATISTICS ====================

function updateRoomStatistics() {

    let available = 0;
    let booked = 0;
    let occupied = 0;
    let maintenance = 0;

    allRooms.forEach(room => {

        const status = getRoomDisplayStatus(room);

        if (status === "AVAILABLE") available++;
        if (status === "BOOKED") booked++;
        if (status === "OCCUPIED") occupied++;
        if (status === "MAINTENANCE") maintenance++;

    });


    // Dashboard statistics

    document.getElementById("totalRooms").textContent =
        allRooms.length;

    document.getElementById("availableRooms").textContent =
        available;

    document.getElementById("occupiedRooms").textContent =
        occupied;

    document.getElementById("maintenanceRooms").textContent =
        maintenance;

    document.getElementById("bookedRooms").textContent =
        booked;

    document.getElementById("roomCount").textContent =
        `${allRooms.length} Rooms`;
}


// ==================== RENDER ROOMS ====================

function renderRooms() {

    const searchValue = roomSearch.value.trim().toLowerCase();
    const selectedStatus = roomStatusFilter.value;

    const filteredRooms = allRooms.filter(room => {

        const roomNumber = String(room.roomNumber || "").toLowerCase();
        const roomType = String(room.roomType || "").toLowerCase();

        const matchesSearch =
            roomNumber.includes(searchValue) ||
            roomType.includes(searchValue);

        const status = getRoomDisplayStatus(room);

        const matchesStatus =
            selectedStatus === "ALL" ||
            status === selectedStatus;

        return matchesSearch && matchesStatus;

    });


    if (filteredRooms.length === 0) {

        roomsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <span>No rooms found.</span>
                </td>
            </tr>
        `;

        return;
    }


    roomsTableBody.innerHTML = filteredRooms.map(room => {

        const status = getRoomDisplayStatus(room);

        const lastCheckoutBooking =
            getLastCheckoutBooking(room.id);

        const lastCheckout = lastCheckoutBooking
            ? formatDate(lastCheckoutBooking.checkOutDate)
            : "No checkout";


        return `
            <tr>

                <td class="room-number-cell">
                    ${escapeHTML(room.roomNumber || "-")}
                </td>

                <td class="room-type-cell">
                    ${escapeHTML(room.roomType || "-")}
                </td>

                <td>
                    ${escapeHTML(room.capacity ?? "-")} Guests
                </td>

                <td class="price-cell">
                    PKR ${formatPrice(room.pricePerNight)}
                </td>

                <td>
                    ${getStatusBadge(status)}
                </td>

                <td>
                    ${escapeHTML(lastCheckout)}
                </td>

                <td>
                    <div class="action-buttons">

                        <button type="button"
                                class="action-button"
                                title="View room history"
                                data-action="history"
                                data-id="${escapeHTML(room.id)}">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                        </button>

                        <button type="button"
                                class="action-button"
                                title="Edit room"
                                data-action="edit"
                                data-id="${escapeHTML(room.id)}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button type="button"
                                class="action-button delete-action"
                                title="Delete room"
                                data-action="delete"
                                data-id="${escapeHTML(room.id)}">
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;

    }).join("");
}


// ==================== SEARCH AND FILTERS ====================

roomSearch.addEventListener("input", renderRooms);

roomStatusFilter.addEventListener("change", renderRooms);


document.getElementById("resetFiltersButton")
    .addEventListener("click", () => {

        roomSearch.value = "";
        roomStatusFilter.value = "ALL";

        renderRooms();

    });


// ==================== ROOM TABLE ACTIONS ====================

roomsTableBody.addEventListener("click", async event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;
    const roomId = button.dataset.id;

    const room = allRooms.find(item =>
        String(item.id) === String(roomId)
    );

    if (!room) return;

    if (action === "history") {
        openRoomHistory(room);
    }

    if (action === "edit") {
        openEditRoomForm(room);
    }

    if (action === "delete") {
        await deleteRoom(room);
    }

});


// ==================== ADD ROOM FORM ====================

function openAddRoomForm() {

    roomForm.reset();

    document.getElementById("roomId").value = "";

    roomFormTitle.textContent = "Add New Room";

    document.getElementById("saveRoomButton").innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Save Room
    `;

    roomFormMessage.textContent = "";

    roomFormSection.hidden = false;

    roomFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


document.getElementById("addNewRoomButton")
    .addEventListener("click", openAddRoomForm);


// ==================== EDIT ROOM FORM ====================

function openEditRoomForm(room) {

    roomForm.reset();

    document.getElementById("roomId").value = room.id;

    document.getElementById("roomNumber").value =
        room.roomNumber || "";

    document.getElementById("roomType").value =
        room.roomType || "";

    document.getElementById("roomCapacity").value =
        room.capacity || "";

    document.getElementById("roomPrice").value =
        room.pricePerNight || "";

    document.getElementById("roomDescription").value =
        room.description || "";

    document.getElementById("roomImageUrl").value =
        room.imageUrl || "";

    document.getElementById("roomStatus").value =
        room.status === "MAINTENANCE" ? "MAINTENANCE" : "AVAILABLE";

    roomFormTitle.textContent =
        `Edit Room ${room.roomNumber}`;

    document.getElementById("saveRoomButton").innerHTML = `
        <i class="fa-solid fa-check"></i>
        Update Room
    `;

    roomFormMessage.textContent = "";

    roomFormSection.hidden = false;

    roomFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==================== SAVE ROOM ====================

roomForm.addEventListener("submit", async event => {

    event.preventDefault();

    const roomId = document.getElementById("roomId").value;

    const roomData = {

        roomNumber: document.getElementById("roomNumber").value.trim(),

        roomType: document.getElementById("roomType").value.trim(),

        description: document.getElementById("roomDescription").value.trim(),

        pricePerNight: Number(
            document.getElementById("roomPrice").value
        ),

        capacity: Number(
            document.getElementById("roomCapacity").value
        ),

        imageUrl: document.getElementById("roomImageUrl").value.trim(),

        status: document.getElementById("roomStatus").value

    };


    const saveButton = document.getElementById("saveRoomButton");

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";

    roomFormMessage.textContent = "";


    try {

        if (roomId) {

            await apiRequest(`${ROOMS_API_URL}/${roomId}`, {

                method: "PUT",
                body: JSON.stringify(roomData)

            });

            roomFormMessage.style.color = "#4caf86";
            roomFormMessage.textContent = "Room updated successfully.";

        } else {

            await apiRequest(`${ROOMS_API_URL}/`, {

                method: "POST",
                body: JSON.stringify(roomData)

            });

            roomFormMessage.style.color = "#4caf86";
            roomFormMessage.textContent = "Room added successfully.";
        }


        roomForm.reset();

        roomFormSection.hidden = true;

        await loadRoomManagementData();

    } catch (error) {

        console.error("Room save error:", error);

        roomFormMessage.style.color = "#d76c6c";
        roomFormMessage.textContent = error.message;

    } finally {

        saveButton.disabled = false;

        saveButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            ${roomId ? "Update Room" : "Save Room"}
        `;
    }
});


// ==================== CANCEL ROOM FORM ====================

document.getElementById("cancelRoomFormButton")
    .addEventListener("click", () => {

        roomForm.reset();

        roomFormSection.hidden = true;

        roomFormMessage.textContent = "";

    });


// ==================== DELETE ROOM ====================

async function deleteRoom(room) {

    const roomBookings = getRoomBookings(room.id);

    const hasFutureOrActiveBooking = roomBookings.some(booking => {

        if (!isConfirmedBooking(booking)) {
            return false;
        }

        return booking.checkOutDate > getToday();

    });

    if (hasFutureOrActiveBooking) {

        alert(
            "This room has an active or upcoming booking. " +
            "You cannot delete it."
        );

        return;
    }


    const confirmed = confirm(
        `Are you sure you want to delete Room ${room.roomNumber}?`
    );

    if (!confirmed) return;


    try {

        await apiRequest(`${ROOMS_API_URL}/${room.id}`, {
            method: "DELETE"
        });

        alert("Room deleted successfully.");

        await loadRoomManagementData();

    } catch (error) {

        console.error("Room delete error:", error);

        alert(error.message);
    }
}


// ==================== ROOM HISTORY MODAL ====================

function openRoomHistory(room) {

    document.getElementById("historyRoomTitle").textContent =
        `Room ${room.roomNumber} History`;

    document.getElementById("historyRoomNumber").textContent =
        room.roomNumber || "-";

    document.getElementById("historyRoomType").textContent =
        room.roomType || "-";

    document.getElementById("historyRoomPrice").textContent =
        `PKR ${formatPrice(room.pricePerNight)}`;

    document.getElementById("historyRoomCapacity").textContent =
        `${room.capacity || "-"} Guests`;

    document.getElementById("historyRoomStatus").textContent =
        getRoomDisplayStatus(room).replace("_", " ");


    const roomBookings = getRoomBookings(room.id)
        .sort((a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );


    if (roomBookings.length === 0) {

        roomHistoryBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    <span>No booking history found for this room.</span>
                </td>
            </tr>
        `;

    } else {

        roomHistoryBody.innerHTML = roomBookings.map(booking => {

            const status = getBookingStatus(booking);

            let displayStatus = status;

            if (
                isConfirmedBooking(booking) &&
                booking.checkOutDate <= getToday()
            ) {
                displayStatus = "CHECKED_OUT";
            }

            return `
                <tr>

                    <td>
                        ${escapeHTML(booking.guestName || "Guest")}
                        <br>
                        <small>${escapeHTML(booking.email || "-")}</small>
                    </td>

                    <td>
                        ${escapeHTML(booking.phoneNumber || "-")}
                    </td>

                    <td>
                        ${escapeHTML(formatDate(booking.checkInDate))}
                    </td>

                    <td>
                        ${escapeHTML(formatDate(booking.checkOutDate))}
                    </td>

                    <td>
                        ${escapeHTML(formatDate(booking.createdAt))}
                    </td>

                    <td>
                        ${getStatusBadge(
                            isCancelledBooking(booking)
                                ? "CANCELLED"
                                : displayStatus
                        )}
                    </td>

                </tr>
            `;

        }).join("");
    }


    roomHistoryModal.classList.add("show");

    roomHistoryModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}


// ==================== CLOSE HISTORY MODAL ====================

function closeRoomHistory() {

    roomHistoryModal.classList.remove("show");

    roomHistoryModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


document.getElementById("closeHistoryModal")
    .addEventListener("click", closeRoomHistory);


roomHistoryModal.addEventListener("click", event => {

    if (event.target === roomHistoryModal) {
        closeRoomHistory();
    }

});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeRoomHistory();
    }

});


// ==================== SIDEBAR ====================

const sidebar = document.getElementById("sidebar");

const sidebarOverlay = document.getElementById("sidebarOverlay");


document.getElementById("menuToggle")
    .addEventListener("click", () => {

        sidebar.classList.add("active");

        sidebarOverlay.classList.add("active");

    });


function closeSidebar() {

    sidebar.classList.remove("active");

    sidebarOverlay.classList.remove("active");
}


document.getElementById("closeSidebar")
    .addEventListener("click", closeSidebar);


sidebarOverlay.addEventListener("click", closeSidebar);


// ==================== LOGOUT ====================

document.getElementById("logoutButton")
    .addEventListener("click", () => {

        const confirmed = confirm("Are you sure you want to logout?");

        if (!confirmed) return;

        sessionStorage.removeItem("adminToken");

        window.location.href = "admin-login.html";

    });


// ==================== DATE AND YEAR ====================

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-PK", {

        day: "2-digit",
        month: "long",
        year: "numeric"

    });


document.getElementById("currentYear").textContent =
    new Date().getFullYear();



// ==================== INITIALIZE PAGE ====================

document.addEventListener("DOMContentLoaded", () => {

    if (!checkAdminAuthentication()) {
        return;
    }

    loadRoomManagementData();

});
