
document.addEventListener("DOMContentLoaded", function () {
    const bookingData = JSON.parse(
        sessionStorage.getItem("bookingReceipt") || "null"
    );

    const selectedRoom = JSON.parse(
        sessionStorage.getItem("selectedRoom") || "null"
    );

    const downloadButton = document.getElementById("downloadReceipt");

    if (!bookingData) {
        document.getElementById("bookingId").textContent =
            "Booking details unavailable";

        document.getElementById("bookingStatus").textContent =
            "Not available";

        if (downloadButton) {
            downloadButton.disabled = true;
            downloadButton.style.opacity = "0.5";
        }

        return;
    }

    function setText(id, value) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent =
                value !== undefined &&
                value !== null &&
                value !== ""
                    ? value
                    : "—";
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "—";

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function formatMoney(amount) {
        if (
            amount === undefined ||
            amount === null ||
            amount === ""
        ) {
            return "PKR —";
        }

        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "PKR —";
        }

        return "PKR " + number.toLocaleString("en-PK", {
            maximumFractionDigits: 2
        });
    }

    const bookingId = bookingData.id || bookingData.bookingId;

    const roomNumber =
        bookingData.roomNumber ||
        (selectedRoom && selectedRoom.roomNumber);

    const roomType =
        bookingData.roomType ||
        bookingData.roomName ||
        (selectedRoom &&
            (
                selectedRoom.roomType ||
                selectedRoom.roomName ||
                selectedRoom.type ||
                selectedRoom.name
            ));

    const checkIn = bookingData.checkInDate;
    const checkOut = bookingData.checkOutDate;

    let nights = "—";
    let nightCount = 0;

    if (checkIn && checkOut) {
        const start = new Date(checkIn + "T00:00:00");
        const end = new Date(checkOut + "T00:00:00");

        const difference = Math.round(
            (end.getTime() - start.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        if (
            Number.isFinite(difference) &&
            difference > 0
        ) {
            nightCount = difference;

            nights =
                difference +
                (difference === 1 ? " Night" : " Nights");
        }
    }

    const guests =
        bookingData.guests ??
        bookingData.guestCount;

    setText("bookingId", bookingId);
    setText("roomNumber", roomNumber);
    setText("roomType", roomType);
    setText("checkInDate", formatDate(checkIn));
    setText("checkOutDate", formatDate(checkOut));
    setText("stayDuration", nights);

    setText(
        "guestCount",
        guests !== undefined &&
        guests !== null &&
        guests !== ""
            ? guests +
                (Number(guests) === 1
                    ? " Guest"
                    : " Guests")
            : "—"
    );

    setText("totalPrice", formatMoney(bookingData.totalPrice));

    const status = bookingData.status || "CONFIRMED";

    setText(
        "bookingStatus",
        status.charAt(0).toUpperCase() +
        status.slice(1).toLowerCase()
    );

    // Download a clean PDF receipt
    if (downloadButton) {
        downloadButton.addEventListener("click", function () {
            if (!window.jspdf) {
                alert(
                    "Failed to load the PDF library. Please check your internet connection."
                );
                return;
            }

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");

            const navy = [23, 38, 56];
            const orange = [216, 117, 61];
            const grey = [105, 114, 126];
            const lightGrey = [225, 228, 232];

            const pageWidth = 210;
            const left = 20;
            const right = 190;

            // Header
            pdf.setFillColor(...navy);
            pdf.rect(0, 0, pageWidth, 43, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(25);
            pdf.text("ELYSIAN", left, 20);

            pdf.setFontSize(10);
            pdf.setTextColor(240, 170, 125);
            pdf.text("HOTEL & STAY", left, 28);

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text("BOOKING RECEIPT", right, 20, {
                align: "right"
            });

            // Confirmation heading
            pdf.setTextColor(...navy);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(19);
            pdf.text("Booking Confirmed", left, 60);

            pdf.setDrawColor(...orange);
            pdf.setLineWidth(1.2);
            pdf.line(left, 67, right, 67);

            // Booking ID and status
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(...grey);

            pdf.text(
                "Booking ID: " + String(
                    bookingId ?? "N/A"
                ),
                left,
                77
            );

            pdf.text(
                "Status: " + String(status).toUpperCase(),
                left,
                84
            );

            // Section heading
            pdf.setTextColor(...navy);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(13);
            pdf.text("Booking Details", left, 100);

            pdf.setDrawColor(...lightGrey);
            pdf.setLineWidth(0.3);
            pdf.line(left, 105, right, 105);

            function drawDetail(label, value, x, y) {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(9);
                pdf.setTextColor(...grey);
                pdf.text(label, x, y);

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(11);
                pdf.setTextColor(...navy);

                const textValue = String(
                    value === undefined ||
                    value === null ||
                    value === ""
                        ? "—"
                        : value
                );

                const lines = pdf.splitTextToSize(
                    textValue,
                    75
                );

                pdf.text(lines, x, y + 7);
            }

            drawDetail("Room Number", roomNumber, 20, 117);
            drawDetail("Room Type", roomType, 110, 117);

            drawDetail(
                "Check-in",
                formatDate(checkIn),
                20,
                145
            );

            drawDetail(
                "Check-out",
                formatDate(checkOut),
                110,
                145
            );

            drawDetail(
                "Guests",
                guests !== undefined &&
                guests !== null &&
                guests !== ""
                    ? guests +
                        (Number(guests) === 1
                            ? " Guest"
                            : " Guests")
                    : "—",
                20,
                173
            );

            drawDetail("Duration", nights, 110, 173);

            // Total amount section
            pdf.setFillColor(248, 245, 241);
            pdf.roundedRect(
                left,
                196,
                right - left,
                27,
                3,
                3,
                "F"
            );

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(...grey);
            pdf.text("Total Amount", 27, 207);

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(16);
            pdf.setTextColor(...orange);
            pdf.text(
                formatMoney(bookingData.totalPrice),
                183,
                212,
                { align: "right" }
            );

            // Footer
            pdf.setDrawColor(...lightGrey);
            pdf.line(left, 238, right, 238);

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.setTextColor(...grey);

            pdf.text(
                "Thank you for choosing Elysian Hotel & Stay.",
                pageWidth / 2,
                248,
                { align: "center" }
            );

            pdf.setFontSize(8);
            pdf.text(
                "We look forward to welcoming you.",
                pageWidth / 2,
                254,
                { align: "center" }
            );

            // Download PDF directly
            const safeBookingId = String(
                bookingId || "Receipt"
            ).replace(/[^a-zA-Z0-9_-]/g, "_");

            pdf.save(
                "Elysian-Booking-Receipt-" +
                safeBookingId +
                ".pdf"
            );
        });
    }
});
