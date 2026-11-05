document.addEventListener("DOMContentLoaded", function () {

    const contactForm = document.getElementById("contactForm");

    if (!contactForm) return;

    contactForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const department = document.getElementById("department").value;
        const message = document.getElementById("message").value.trim();

        const whatsappNumber = "923232892925";

        const whatsappMessage =
            "ELYSIAN HOTEL & STAY - Contact Form\n\n" +
            "Name: " + name + "\n" +
            "Email: " + email + "\n" +
            "Phone: " + (phone || "Not provided") + "\n" +
            "Department: " + department + "\n\n" +
            "Message:\n" + message;

        const whatsappURL =
            "https://wa.me/" + whatsappNumber +
            "?text=" + encodeURIComponent(whatsappMessage);

        window.open(whatsappURL, "_blank");

    });

});
