
const loginForm = document.getElementById("adminLoginForm");
const emailInput = document.getElementById("adminEmail");
const passwordInput = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const loginButton = loginForm?.querySelector('button[type="submit"]');

// Admin mode private URL se select hoga:
// admin-login.html?mode=admin
const params = new URLSearchParams(window.location.search);
const isAdminLogin = params.get("mode") === "admin";

// Login page par text update karo
if (loginForm) {
    const buttonText = loginButton?.querySelector("span");

    if (buttonText) {
        buttonText.textContent = isAdminLogin
            ? "Sign In to Dashboard"
            : "Sign In to Your Account";
    }

    const emailLabel = document.querySelector('label[for="adminEmail"]');
    const emailPlaceholder = document.getElementById("adminEmail");

    if (emailLabel) emailLabel.textContent = "Email Address";

    if (emailPlaceholder) {
        emailPlaceholder.placeholder = "Enter your email address";
    }
}

// Show / Hide Password
document.querySelectorAll(".toggle-password").forEach((button) => {
    button.addEventListener("click", () => {
        const targetId = button.dataset.target;
        const passwordField = document.getElementById(targetId);
        const icon = button.querySelector("i");

        if (!passwordField) return;

        const isPassword = passwordField.type === "password";
        passwordField.type = isPassword ? "text" : "password";

        if (icon) {
            icon.classList.toggle("fa-eye", !isPassword);
            icon.classList.toggle("fa-eye-slash", isPassword);
        }

        button.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );
    });
});

// Login
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            loginMessage.textContent =
                "Please enter your email and password.";
            return;
        }

        loginMessage.textContent = "Logging in...";

        if (loginButton) loginButton.disabled = true;

        try {
            const endpoint = isAdminLogin
                ? "http://localhost:8080/api/admin/login"
                : "http://localhost:8080/api/auth/login";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    result?.message ||
                    result?.error ||
                    "Login failed. Please check your credentials."
                );
            }

            if (!result?.token) {
                throw new Error("Login response does not contain a token.");
            }

            const role = String(result.role || "").toUpperCase();

            if (isAdminLogin) {
                // Accept only the ADMIN role during admin login
                if (role !== "ADMIN") {
                    throw new Error("Admin account required.");
                }

                sessionStorage.setItem("adminToken", result.token);
                sessionStorage.setItem("adminData", JSON.stringify({
                    id: result.id,
                    name: result.name || result.fullName || "",
                    email: result.email,
                    role: result.role
                }));

                loginMessage.textContent = "Login successful!";
                window.location.href = "admin-dashboard.html";
                return;
            }

            // Accept only the USER role during regular login
            if (role !== "USER") {
                throw new Error(
                    "Please use the correct account to sign in."
                );
            }

            sessionStorage.setItem("userToken", result.token);
            sessionStorage.setItem("userData", JSON.stringify({
                id: result.id,
                fullName: result.fullName || result.name || "",
                email: result.email,
                role: result.role
            }));

            loginMessage.textContent = "Login successful!";

            // Return to the saved page if the user came from the booking process
            const returnTo = sessionStorage.getItem("bookingReturnTo");

            if (returnTo && returnTo.startsWith("rooms_details.html")) {
                sessionStorage.removeItem("bookingReturnTo");
                window.location.href = returnTo;
            } else {
                window.location.href = "../index.html";
            }

        } catch (error) {
            loginMessage.textContent =
                error.message || "Unable to log in. Please try again.";
        } finally {
            if (loginButton) loginButton.disabled = false;
        }
    });
}

// Forgot Password
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (event) => {
        event.preventDefault();
        loginMessage.textContent =
            "Password reset functionality is not available yet.";
    });
}
