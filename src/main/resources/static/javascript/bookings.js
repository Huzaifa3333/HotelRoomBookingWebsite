
// =========================================
// ELYSIAN HOTEL & STAY — BOOKINGS
// BOOKING MANAGEMENT
// =========================================

const API_BASE_URL = "http://localhost:8080";
const BOOKINGS_API_URL = `${API_BASE_URL}/api/booking/all`;

let allBookings = [];
let filteredBookings = [];

// =========================================
// DOM ELEMENTS
// =========================================

const totalBookingsElement = document.getElementById("totalBookings");
const confirmedBookingsElement = document.getElementById("confirmedBookings");
const cancelledBookingsElement = document.getElementById("cancelledBookings");
const completedBookingsElement = document.getElementById("completedBookings");

const bookingsTableBody = document.getElementById("bookingsTableBody");
const bookingSearch = document.getElementById("bookingSearch");
const bookingStatusFilter = document.getElementById("bookingStatusFilter");
const bookingCount = document.getElementById("bookingCount");
const tableResultText = document.getElementById("tableResultText");

const bookingDetailsModal = document.getElementById("bookingDetailsModal");
const bookingDetailsContent = document.getElementById("bookingDetailsContent");
const closeBookingModal = document.getElementById("closeBookingModal");


// =========================================
// AUTHENTICATION
// =========================================

function checkAdminAuthentication() {

    const token = sessionStorage.getItem("adminToken");
    const adminData = sessionStorage.getItem("adminData");

    if (!token || !adminData) {
        window.location.href = "admin-login.html?mode=admin";
        return false;
    }

    return true;
}


// =========================================
// ADMIN PROFILE
// =========================================

function loadAdminProfile() {

    const adminData = sessionStorage.getItem("adminData");

    if (!adminData) return;

    try {

        const admin = JSON.parse(adminData);

        const name =
            admin.fullName ||
            admin.name ||
            admin.firstName ||
            admin.email ||
            "Administrator";

        const adminName = document.getElementById("adminName");
        const profileAvatar = document.getElementById("profileAvatar");

        if (adminName) {
            adminName.textContent = name;
        }

        if (profileAvatar) {
            profileAvatar.textContent = name.charAt(0).toUpperCase();
        }

    } catch (error) {
        console.error("Unable to load admin profile:", error);
    }
}


// =========================================
// API REQUEST
// =========================================

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
        throw new Error("Your session has expired or you are not authorized.");
    }

    if (!response.ok) {

        let errorMessage = "Unable to load booking records.";

        try {
            const errorData = await response.json();

            errorMessage =
                errorData.message ||
                errorData.error ||
                errorMessage;

        } catch (error) {
            // Keep default error message.
        }

        throw new Error(errorMessage);
    }

    return response.json();
}


// =========================================
// SAFE HTML
// =========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });
}


// =========================================
// DATE HELPERS
// =========================================

function getLocalDateString() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateValue) {

    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getCurrentDate() {

    const currentDate = document.getElementById("currentDate");

    if (!currentDate) return;

    currentDate.textContent = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// =========================================
// BOOKING DATA HELPERS
// =========================================

function getGuestName(booking) {

    const guest =
        booking.user ||
        booking.guest ||
        booking.customer ||
        {};

    if (typeof booking.guestName === "string") {
        return booking.guestName;
    }

    if (typeof booking.userName === "string") {
        return booking.userName;
    }

    const firstName =
        guest.firstName ||
        guest.first_name ||
        "";

    const lastName =
        guest.lastName ||
        guest.last_name ||
        "";

    const fullName = `${firstName} ${lastName}`.trim();

    return (
        fullName ||
        guest.name ||
        guest.fullName ||
        booking.name ||
        "Guest"
    );
}


function getGuestEmail(booking) {

    const guest =
        booking.user ||
        booking.guest ||
        booking.customer ||
        {};

    return (
        booking.email ||
        guest.email ||
        booking.guestEmail ||
        "—"
    );
}


function getGuestPhone(booking) {

    const guest =
        booking.user ||
        booking.guest ||
        booking.customer ||
        {};

    return (
        booking.phone ||
        booking.phoneNumber ||
        guest.phone ||
        guest.phoneNumber ||
        "—"
    );
}


function getRoomNumber(booking) {

    const room = booking.room || {};

    return (
        room.roomNumber ||
        booking.roomNumber ||
        booking.roomId ||
        "—"
    );
}


function getBookingId(booking) {

    return (
        booking.id ||
        booking.bookingId ||
        "—"
    );
}


function getCheckInDate(booking) {

    return (
        booking.checkInDate ||
        booking.checkIn ||
        booking.checkInTime ||
        null
    );
}


function getCheckOutDate(booking) {

    return (
        booking.checkOutDate ||
        booking.checkOut ||
        booking.checkOutTime ||
        null
    );
}


function getBookingAmount(booking) {

    return (
        booking.totalAmount ??
        booking.totalPrice ??
        booking.totalCost ??
        booking.amount ??
        booking.price ??
        null
    );
}


function getGuestCount(booking) {

    return (
        booking.numberOfGuests ??
        booking.guestCount ??
        booking.totalGuests ??
        booking.guests ??
        "—"
    );
}


function formatPrice(amount) {

    if (amount === null || amount === undefined || amount === "") {
        return "—";
    }

    const number = Number(amount);

    if (Number.isNaN(number)) {
        return escapeHTML(amount);
    }

    return `PKR ${number.toLocaleString("en-PK")}`;
}


// =========================================
// BOOKING STATUS
// =========================================

function getBookingStatus(booking) {

    const backendStatus = String(
        booking.status || "PENDING"
    ).toUpperCase();

    if (backendStatus === "CANCELLED") {
        return "CANCELLED";
    }

    if (backendStatus === "COMPLETED") {
        return "COMPLETED";
    }

    const checkOut = getCheckOutDate(booking);

    if (checkOut) {

        const checkOutDate = String(checkOut).substring(0, 10);

        if (
            backendStatus === "CONFIRMED" &&
            checkOutDate <= getLocalDateString()
        ) {
            return "COMPLETED";
        }
    }

    return backendStatus;
}


function getStatusClass(status) {

    switch (status) {

        case "CONFIRMED":
            return "status-confirmed";

        case "CANCELLED":
            return "status-cancelled";

        case "COMPLETED":
            return "status-completed";

        default:
            return "status-pending";
    }
}


// =========================================
// LOAD BOOKINGS
// =========================================

async function loadBookings() {

    try {

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Loading booking records...</span>
                </td>
            </tr>
        `;

        const response = await apiRequest(BOOKINGS_API_URL);

        // Supports both direct array and wrapped response.
        if (Array.isArray(response)) {
            allBookings = response;
        } else if (Array.isArray(response.data)) {
            allBookings = response.data;
        } else if (Array.isArray(response.bookings)) {
            allBookings = response.bookings;
        } else {
            allBookings = [];
        }

        updateBookingStatistics();
        applyBookingFilters();

    } catch (error) {

        console.error("Booking loading error:", error);

        if (
            error.message.includes("expired") ||
            error.message.includes("authorized")
        ) {
            sessionStorage.removeItem("adminToken");
            sessionStorage.removeItem("adminData");

            window.location.href = "admin-login.html?mode=admin";
            return;
        }

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>${escapeHTML(error.message)}</span>
                </td>
            </tr>
        `;

        allBookings = [];
        updateBookingStatistics();
    }
}


// =========================================
// UPDATE STATISTICS
// =========================================

function updateBookingStatistics() {

    let confirmed = 0;
    let cancelled = 0;
    let completed = 0;

    allBookings.forEach(booking => {

        const status = getBookingStatus(booking);

        if (status === "CONFIRMED") {
            confirmed++;
        } else if (status === "CANCELLED") {
            cancelled++;
        } else if (status === "COMPLETED") {
            completed++;
        }

    });

    totalBookingsElement.textContent = allBookings.length;
    confirmedBookingsElement.textContent = confirmed;
    cancelledBookingsElement.textContent = cancelled;
    completedBookingsElement.textContent = completed;
}


// =========================================
// SEARCH AND FILTER
// =========================================

function applyBookingFilters() {

    const searchValue = bookingSearch.value
        .trim()
        .toLowerCase();

    const selectedStatus = bookingStatusFilter.value;

    filteredBookings = allBookings.filter(booking => {

        const guestName = getGuestName(booking).toLowerCase();

        const bookingId = String(getBookingId(booking)).toLowerCase();

        const roomNumber = String(getRoomNumber(booking)).toLowerCase();

        const matchesSearch =
            guestName.includes(searchValue) ||
            bookingId.includes(searchValue) ||
            roomNumber.includes(searchValue);

        const matchesStatus =
            selectedStatus === "ALL" ||
            getBookingStatus(booking) === selectedStatus;

        return matchesSearch && matchesStatus;

    });

    renderBookings();
}


// =========================================
// RENDER BOOKING TABLE
// =========================================

function renderBookings() {

    bookingCount.textContent =
        `${filteredBookings.length} Bookings`;

    tableResultText.textContent =
        `Showing ${filteredBookings.length} of ${allBookings.length} bookings`;

    if (filteredBookings.length === 0) {

        bookingsTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-state">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <span>No booking records found.</span>
                </td>
            </tr>
        `;

        return;
    }

    bookingsTableBody.innerHTML = filteredBookings.map((booking, index) => {

        const id = getBookingId(booking);
        const guestName = getGuestName(booking);
        const roomNumber = getRoomNumber(booking);

        const checkIn = formatDate(getCheckInDate(booking));
        const checkOut = formatDate(getCheckOutDate(booking));

        const amount = formatPrice(getBookingAmount(booking));
        const guestCount = getGuestCount(booking);

        const bookingDate = formatDate(
            booking.createdAt ||
            booking.bookingDate ||
            booking.createdOn
        );

        const status = getBookingStatus(booking);

        const shortId = String(id).length > 10
            ? String(id).substring(0, 8).toUpperCase()
            : String(id);

        return `
            <tr>

                <td>
                    <span class="booking-id">
                        #${escapeHTML(shortId)}
                    </span>
                </td>

                <td>
                    <span class="guest-name">
                        ${escapeHTML(guestName)}
                    </span>
                </td>

                <td>
                    <span class="room-number">
                        ${escapeHTML(roomNumber)}
                    </span>
                </td>

                <td>${escapeHTML(checkIn)}</td>

                <td>${escapeHTML(checkOut)}</td>

                <td>${escapeHTML(guestCount)}</td>

                <td>
                    <span class="amount-cell">
                        ${escapeHTML(amount)}
                    </span>
                </td>

                <td>${escapeHTML(bookingDate)}</td>

                <td>
                    <span class="status-badge ${getStatusClass(status)}">
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="view-booking-button"
                        data-booking-index="${index}"
                    >
                        <i class="fa-regular fa-eye"></i>
                        View
                    </button>
                </td>

            </tr>
        `;

    }).join("");
}


// =========================================
// BOOKING DETAILS MODAL
// =========================================

function showBookingDetails(index) {

    const booking = filteredBookings[index];

    if (!booking) return;

    const status = getBookingStatus(booking);

    const guestName = getGuestName(booking);
    const email = getGuestEmail(booking);
    const phone = getGuestPhone(booking);

    const roomNumber = getRoomNumber(booking);

    const checkIn = formatDate(getCheckInDate(booking));
    const checkOut = formatDate(getCheckOutDate(booking));

    const bookingDate = formatDate(
        booking.createdAt ||
        booking.bookingDate ||
        booking.createdOn
    );

    const amount = formatPrice(getBookingAmount(booking));

    const guestCount = getGuestCount(booking);

    const bookingId = getBookingId(booking);

    bookingDetailsContent.innerHTML = `

        <div class="detail-section-title">
            BOOKING INFORMATION
        </div>

        <div class="booking-details-grid">

            <div class="detail-item">
                <span>BOOKING ID</span>
                <strong>${escapeHTML(bookingId)}</strong>
            </div>

            <div class="detail-item">
                <span>BOOKING DATE</span>
                <strong>${escapeHTML(bookingDate)}</strong>
            </div>

            <div class="detail-item">
                <span>ROOM NUMBER</span>
                <strong>${escapeHTML(roomNumber)}</strong>
            </div>

            <div class="detail-item">
                <span>NUMBER OF GUESTS</span>
                <strong>${escapeHTML(guestCount)}</strong>
            </div>

            <div class="detail-item">
                <span>CHECK-IN</span>
                <strong>${escapeHTML(checkIn)}</strong>
            </div>

            <div class="detail-item">
                <span>CHECK-OUT</span>
                <strong>${escapeHTML(checkOut)}</strong>
            </div>

            <div class="detail-item">
                <span>TOTAL AMOUNT</span>
                <strong>${escapeHTML(amount)}</strong>
            </div>

        </div>

        <div class="detail-section-title">
            GUEST INFORMATION
        </div>

        <div class="booking-details-grid">

            <div class="detail-item">
                <span>GUEST NAME</span>
                <strong>${escapeHTML(guestName)}</strong>
            </div>

            <div class="detail-item">
                <span>EMAIL ADDRESS</span>
                <strong>${escapeHTML(email)}</strong>
            </div>

            <div class="detail-item">
                <span>PHONE NUMBER</span>
                <strong>${escapeHTML(phone)}</strong>
            </div>

        </div>

        <div class="modal-status">
            <span class="status-badge ${getStatusClass(status)}">
                ${escapeHTML(status)}
            </span>
        </div>

    `;

    bookingDetailsModal.classList.add("show");
    document.body.style.overflow = "hidden";
}


function hideBookingDetails() {

    bookingDetailsModal.classList.remove("show");
    document.body.style.overflow = "";
}


// =========================================
// EVENT LISTENERS
// =========================================

// Search
bookingSearch.addEventListener("input", applyBookingFilters);


// Status filter
bookingStatusFilter.addEventListener("change", applyBookingFilters);


// Reset filters
document.getElementById("resetFiltersButton")
    .addEventListener("click", () => {

        bookingSearch.value = "";
        bookingStatusFilter.value = "ALL";

        applyBookingFilters();

    });


// View booking details
bookingsTableBody.addEventListener("click", event => {

    const viewButton = event.target.closest(".view-booking-button");

    if (!viewButton) return;

    const index = Number(viewButton.dataset.bookingIndex);

    showBookingDetails(index);

});


// Close modal
closeBookingModal.addEventListener("click", hideBookingDetails);


// Close modal by clicking outside
bookingDetailsModal.addEventListener("click", event => {

    if (event.target === bookingDetailsModal) {
        hideBookingDetails();
    }

});


// Close modal with Escape
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        hideBookingDetails();
    }

});


// =========================================
// SIDEBAR
// =========================================
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const closeSidebar = document.getElementById("closeSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openSidebar() {

    sidebar?.classList.add("active");
    sidebarOverlay?.classList.add("show");

    document.body.style.overflow = "hidden";
}

function hideSidebar() {

    sidebar?.classList.remove("active");
    sidebarOverlay?.classList.remove("show");

    document.body.style.overflow = "";
}


// Open sidebar
menuToggle?.addEventListener("click", openSidebar);


// Close sidebar
closeSidebar?.addEventListener("click", hideSidebar);


// Close sidebar by clicking overlay
sidebarOverlay?.addEventListener("click", hideSidebar);


// Close sidebar with Escape key
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        hideSidebar();
    }

});


// Close sidebar after clicking navigation link
document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {

    link.addEventListener("click", hideSidebar);

});


// =========================================
// LOGOUT
// =========================================

document.getElementById("logoutButton")
    .addEventListener("click", () => {

        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminData");

        window.location.href = "admin-login.html?mode=admin";

    });


// =========================================
// INITIALIZE PAGE
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    if (!checkAdminAuthentication()) {
        return;
    }

    loadAdminProfile();
    getCurrentDate();
    loadBookings();

});
