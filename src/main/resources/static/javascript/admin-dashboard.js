
const API_BASE_URL = "http://localhost:8080";
const ROOMS_API_URL = `${API_BASE_URL}/api/rooms`;
const DASHBOARD_STATS_URL = `${API_BASE_URL}/api/admin/dashboard/stats`;
const BOOKINGS_API_URL = `${API_BASE_URL}/api/booking/all`;

// ==================== AUTHENTICATION ====================

function isAdminLoggedIn() {
    return Boolean(
        sessionStorage.getItem("adminToken") &&
        sessionStorage.getItem("adminData")
    );
}

if (!isAdminLoggedIn()) {
    window.location.replace("admin-login.html?mode=admin");
}

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminData");

        window.location.href = "../index.html";
    });
}

// Show admin name
try {
    const savedAdmin = JSON.parse(
        sessionStorage.getItem("adminData") || "null"
    );

    if (savedAdmin) {
        const name =
            savedAdmin.name ||
            savedAdmin.fullName ||
            "Administrator";

        const adminName = document.getElementById("adminName");
        const welcomeName = document.getElementById("welcomeName");
        const profileAvatar = document.getElementById("profileAvatar");

        if (adminName) adminName.textContent = name;
        if (welcomeName) welcomeName.textContent = name;

        if (profileAvatar) {
            profileAvatar.textContent = name.charAt(0).toUpperCase();
        }
    }
} catch (error) {
    console.error("Failed to read admin data:", error);
}

// ==================== API REQUEST ====================

async function apiRequest(url, options = {}) {
    const token = sessionStorage.getItem("adminToken");

    const response = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json"
        }
    });

    if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminData");

        window.location.replace("admin-login.html?mode=admin");

        throw new Error("Your session has expired or you do not have permission.");
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    const responseText = await response.text();

    if (!responseText) return null;

    try {
        return JSON.parse(responseText);
    } catch {
        return responseText;
    }
}

// ==================== HELPERS ====================

function formatPrice(price) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return "PKR 0";

    return `PKR ${amount.toLocaleString("en-PK", {
        maximumFractionDigits: 2
    })}`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function showMessage(element, message, isError = false) {
    if (!element) return;

    element.textContent = message;
    element.style.color = isError ? "#dc2626" : "#15803d";
}

// ==================== DASHBOARD DATE ====================

const currentDate = document.getElementById("currentDate");
const currentYear = document.getElementById("currentYear");

if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString("en-PK", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// ==================== LOAD DASHBOARD STATS ====================

async function loadDashboardStats() {
    try {
        const stats = await apiRequest(DASHBOARD_STATS_URL);

        if (!stats || typeof stats !== "object") return;

        const totalRoomsElement = document.getElementById("totalRooms");
        const totalBookingsElement = document.getElementById("totalBookings");
        const availableRoomsElement = document.getElementById("availableRooms");

        if (totalRoomsElement && stats.totalRooms !== undefined) {
            totalRoomsElement.textContent = stats.totalRooms;
        }

        if (totalBookingsElement && stats.totalBookings !== undefined) {
            totalBookingsElement.textContent = stats.totalBookings;
        }

        if (availableRoomsElement && stats.availableRooms !== undefined) {
            availableRoomsElement.textContent = stats.availableRooms;
        }

        const revenueElement = document.getElementById("totalRevenue");

        if (revenueElement && stats.totalRevenue !== undefined) {
            revenueElement.textContent = formatPrice(stats.totalRevenue);
        }
    } catch (error) {
        console.warn("Failed to load dashboard statistics:", error);
    }
}

// ==================== LOAD ROOMS ====================

async function loadRooms() {
    const roomsTableBody = document.getElementById("roomsTableBody");

    if (!roomsTableBody) return;

    roomsTableBody.innerHTML = `
        <tr><td colspan="6">Loading rooms...</td></tr>
    `;

    try {
        const rooms = await apiRequest(ROOMS_API_URL);

        if (!Array.isArray(rooms)) {
            throw new Error("The backend response is not a list of rooms.");
        }

        rooms.sort((a, b) =>
            String(a.roomNumber ?? "").localeCompare(
                String(b.roomNumber ?? ""),
                undefined,
                { numeric: true }
            )
        );

        const availableCount = rooms.filter(
            room => String(room.status).toUpperCase() === "AVAILABLE"
        ).length;

        const occupiedCount = rooms.filter(
            room => String(room.status).toUpperCase() === "OCCUPIED"
        ).length;

        const maintenanceCount = rooms.filter(
            room => String(room.status).toUpperCase() === "MAINTENANCE"
        ).length;

        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        setText("totalRooms", rooms.length);
        setText("totalRoomsCount", rooms.length);
        setText("availableRooms", availableCount);
        setText("roomAvailableCount", availableCount);
        setText("roomOccupiedCount", occupiedCount);
        setText("roomMaintenanceCount", maintenanceCount);

        if (rooms.length === 0) {
            roomsTableBody.innerHTML = `
                <tr><td colspan="6">No rooms found.</td></tr>
            `;
            return;
        }

        roomsTableBody.innerHTML = "";

        rooms.forEach(room => {
            const row = document.createElement("tr");
            const status = String(room.status || "UNKNOWN").toUpperCase();

            let statusClass = "status-unknown";

            if (status === "AVAILABLE") statusClass = "status-available";
            if (status === "OCCUPIED") statusClass = "status-occupied";
            if (status === "MAINTENANCE") statusClass = "status-maintenance";

            row.innerHTML = `
                <td>${escapeHTML(room.roomNumber)}</td>
                <td>${escapeHTML(room.roomType)}</td>
                <td>${escapeHTML(room.capacity)}</td>
                <td>${escapeHTML(formatPrice(room.pricePerNight))}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(status)}
                    </span>
                </td>
                <td>—</td>
            `;

            roomsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load rooms:", error);

        roomsTableBody.innerHTML = `
            <tr>
                <td colspan="6">Could not load rooms. ${escapeHTML(error.message)}</td>
            </tr>
        `;
    }
}

// ==================== ADD ROOM FORM ====================

const addRoomFormSection = document.getElementById("addRoomFormSection");
const addRoomForm = document.getElementById("addRoomForm");
const saveRoomButton = document.getElementById("saveRoomButton");
const addRoomMessage = document.getElementById("addRoomMessage");

function openAddRoomForm() {
    if (!addRoomFormSection) return;

    addRoomFormSection.hidden = false;
    addRoomFormSection.style.display = "block";

    addRoomFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    if (addRoomMessage) addRoomMessage.textContent = "";
}

function closeAddRoomForm() {
    if (addRoomFormSection) {
        addRoomFormSection.hidden = true;
        addRoomFormSection.style.display = "none";
    }

    if (addRoomForm) addRoomForm.reset();
    if (addRoomMessage) addRoomMessage.textContent = "";
}

const addRoomButton = document.getElementById("addRoomButton");
const addNewRoomButton = document.getElementById("addNewRoomButton");
const cancelAddRoomButton = document.getElementById("cancelAddRoomButton");
const resetRoomFormButton = document.getElementById("resetRoomFormButton");

if (addRoomButton) {
    addRoomButton.addEventListener("click", openAddRoomForm);
}

if (addNewRoomButton) {
    addNewRoomButton.addEventListener("click", openAddRoomForm);
}

if (cancelAddRoomButton) {
    cancelAddRoomButton.addEventListener("click", closeAddRoomForm);
}

if (resetRoomFormButton && addRoomForm) {
    resetRoomFormButton.addEventListener("click", () => {
        addRoomForm.reset();
        if (addRoomMessage) addRoomMessage.textContent = "";
    });
}

if (addRoomForm) {
    addRoomForm.addEventListener("submit", async event => {
        event.preventDefault();

        const roomNumber = document.getElementById("roomNumber")?.value.trim();
        const roomType = document.getElementById("roomType")?.value.trim();
        const description = document.getElementById("roomDescription")?.value.trim();
        const pricePerNight = Number(document.getElementById("roomPrice")?.value);
        const capacity = Number(document.getElementById("roomCapacity")?.value);
        const imageUrl = document.getElementById("roomImageUrl")?.value.trim();

        if (
            !roomNumber ||
            !roomType ||
            !Number.isFinite(pricePerNight) ||
            pricePerNight <= 0 ||
            !Number.isInteger(capacity) ||
            capacity <= 0
        ) {
            showMessage(
                addRoomMessage,
                "Please enter a room number, room type, valid price, and capacity.",
                true
            );
            return;
        }

        const roomData = {
            roomNumber,
            roomType,
            description: description || "",
            pricePerNight,
            capacity,
            imageUrl: imageUrl || ""
        };

        try {
            if (saveRoomButton) {
                saveRoomButton.disabled = true;
                saveRoomButton.textContent = "Saving...";
            }

            showMessage(addRoomMessage, "Saving room...");

            await apiRequest(ROOMS_API_URL, {
                method: "POST",
                body: JSON.stringify(roomData)
            });

            showMessage(addRoomMessage, "Room added successfully!");

            addRoomForm.reset();

            await loadRooms();
            await loadDashboardStats();
        } catch (error) {
            console.error("Failed to add room:", error);

            showMessage(
                addRoomMessage,
                error.message || "Failed to add room.",
                true
            );
        } finally {
            if (saveRoomButton) {
                saveRoomButton.disabled = false;
                saveRoomButton.innerHTML =
                    '<i class="fa-solid fa-plus"></i> Save Room';
            }
        }
    });
}

// ==================== EMPTY TABLE ROW ====================

function createEmptyRow(element, columnCount, message) {
    if (!element) return;

    element.innerHTML = `
        <tr>
            <td colspan="${columnCount}">${escapeHTML(message)}</td>
        </tr>
    `;
}

// ==================== RECENT BOOKINGS ====================

async function loadRecentBookings() {
    const tableBody = document.getElementById("recentBookingsBody");

    if (!tableBody) return;

    createEmptyRow(tableBody, 4, "Loading bookings...");

    try {
        const bookings = await apiRequest(BOOKINGS_API_URL);

        if (!Array.isArray(bookings)) {
            throw new Error("The backend response is not a list of bookings.");
        }

        const activeBookings = bookings
            .filter(booking => booking.status === "CONFIRMED")
            .sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(0, 5);

        if (activeBookings.length === 0) {
            createEmptyRow(
                tableBody,
                4,
                "No confirmed bookings available."
            );
            return;
        }

        tableBody.innerHTML = activeBookings.map(booking => `
            <tr>
                <td>${escapeHTML(booking.guestName || "Guest")}</td>
                <td>${escapeHTML(booking.roomNumber || "-")}</td>
                <td>${escapeHTML(booking.checkInDate || "-")}</td>
                <td>
                    <span class="status-badge confirmed">
                        Confirmed
                    </span>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Unable to load booking:", error);

        createEmptyRow(
            tableBody,
            4,
            "Unable to load bookings."
        );
    }
}

// ==================== RECENT GUESTS ====================

async function loadRecentGuests() {
    const tableBody = document.getElementById("recentGuestsBody");

    if (!tableBody) return;

    createEmptyRow(tableBody, 8, "Loading guests...");

    try {
        const bookings = await apiRequest(BOOKINGS_API_URL);

        if (!Array.isArray(bookings)) {
            throw new Error("The backend response is not a list of bookings.");
        }

        // Latest 5 bookings, including cancelled bookings
        const recentGuests = [...bookings]
            .sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(0, 5);

        if (recentGuests.length === 0) {
            createEmptyRow(tableBody, 8, "No guests found.");
            return;
        }

        tableBody.innerHTML = recentGuests.map(booking => `
            <tr>
                <td>${escapeHTML(booking.guestName || "Guest")}</td>
                <td>${escapeHTML(booking.email || "-")}</td>
                <td>${escapeHTML(booking.phoneNumber || "-")}</td>
                <td>${escapeHTML(booking.roomNumber || "-")}</td>
                <td>${escapeHTML(booking.checkInDate || "-")}</td>
                <td>${escapeHTML(booking.checkOutDate || "-")}</td>
                <td>${escapeHTML(
                    booking.createdAt
                        ? booking.createdAt.split("T")[0]
                        : "-"
                )}</td>
                <td>
                    <span class="status-badge ${
                        booking.status === "CANCELLED"
                            ? "status-unknown"
                            : "confirmed"
                    }">
                        ${escapeHTML(booking.status || "UNKNOWN")}
                    </span>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Failed to load guests:", error);

        createEmptyRow(
            tableBody,
            8,
            "Unable to load guests."
        );
    }
}


// ==================== INITIALIZE DASHBOARD ====================

// ==================== VIEW ALL BOOKINGS ====================

const viewBookingsButton = document.getElementById("viewBookingsButton");

if (viewBookingsButton) {
    viewBookingsButton.addEventListener("click", function () {
        window.location.href = "bookings.html";
    });
}

const manageRoomsButton = document.getElementById("manageRoomsButton");
if (manageRoomsButton) {
    manageRoomsButton.addEventListener("click", () => {
        window.location.href = "manage-rooms.html";
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
    loadRooms();
    loadRecentBookings();
    loadRecentGuests();
});


// ==================== MOBILE SIDEBAR ====================

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar() {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeSidebarMenu() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

if (menuToggle) {
    menuToggle.addEventListener("click", openSidebar);
}

if (closeSidebar) {
    closeSidebar.addEventListener("click", closeSidebarMenu);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebarMenu);
}

// Close sidebar after clicking a navigation link
document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
    link.addEventListener("click", closeSidebarMenu);
});

// Close sidebar with Escape key
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeSidebarMenu();
    }
});