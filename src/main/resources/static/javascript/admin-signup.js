
document.addEventListener("DOMContentLoaded", function () {

    const signupForm = document.getElementById("adminSignupForm");
    const signupMessage = document.getElementById("signupMessage");

    if (!signupForm || !signupMessage) return;

    const submitButton = signupForm.querySelector('button[type="submit"]');

    // Display the page as a user signup page
    const title = document.querySelector(".form-heading h2");
    const submitButtonText = submitButton;

    if (title) {
        title.textContent = "Create Your Account";
    }

    if (submitButtonText) {
        const icon = submitButtonText.querySelector("i");
        submitButtonText.textContent = "Create Account ";

        if (icon) {
            submitButtonText.appendChild(icon);
        }
    }

    // Password Show / Hide
    document.querySelectorAll(".toggle-password").forEach(function (button) {
        button.addEventListener("click", function () {

            const targetId = button.getAttribute("data-target");
            const passwordInput = document.getElementById(targetId);
            const icon = button.querySelector("i");

            if (!passwordInput) return;

            const showPassword = passwordInput.type === "password";
            passwordInput.type = showPassword ? "text" : "password";

            if (icon) {
                icon.classList.toggle("fa-eye", !showPassword);
                icon.classList.toggle("fa-eye-slash", showPassword);
            }

            button.setAttribute(
                "aria-label",
                showPassword ? "Hide password" : "Show password"
            );
        });
    });

    // User Signup
    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("adminName").value.trim();
        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const agreeTerms = document.getElementById("agreeTerms");

        signupMessage.textContent = "";
        signupMessage.style.color = "#ff7777";

        if (!name) {
            signupMessage.textContent = "Please enter your full name.";
            return;
        }

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!()]).{8,}$/;

        if (!passwordPattern.test(password)) {
            signupMessage.textContent =
                "Password must have 8+ characters, uppercase, lowercase, number and special character.";
            return;
        }

        if (password !== confirmPassword) {
            signupMessage.textContent =
                "Password and confirm password do not match.";
            return;
        }

        if (!agreeTerms.checked) {
            signupMessage.textContent =
                "Please accept the Terms & Conditions.";
            return;
        }

        // Fields for the UserRegisterReq request
        const requestData = {
            fullName: name,
            email: email,
            password: password
        };

        try {
            submitButton.disabled = true;
            submitButton.style.opacity = "0.7";
            signupMessage.style.color = "#c77b55";
            signupMessage.textContent = "Creating your account...";

            const response = await fetch(
                "http://localhost:8080/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                }
            );

            const result = await response.json().catch(function () {
                return {};
            });

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Signup failed. Please check your details."
                );
            }

            signupMessage.style.color = "#8bd49c";
            signupMessage.textContent =
                "Account created successfully! Please sign in.";



            const loginUrl = new URL("admin-login.html", window.location.href);

            loginUrl.searchParams.set("mode", "user");

            window.location.href = loginUrl.href;

        } catch (error) {
            signupMessage.style.color = "#ff7777";
            signupMessage.textContent =
                error.message ||
                "Could not connect to the server. Please try again.";

        } finally {
            submitButton.disabled = false;
            submitButton.style.opacity = "1";
        }
    });

});
