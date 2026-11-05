
document.addEventListener("DOMContentLoaded", function () {
    const authLink = document.getElementById("authLink");
    const authText = document.getElementById("authText");

    if (!authLink || !authText) return;

    function updateAuthNavbar() {
        const userToken = sessionStorage.getItem("userToken");
        const isInPagesFolder = window.location.pathname.includes("/pages/");

        if (userToken) {
            authText.textContent = "Sign Out";
            authLink.href = "#";
        } else {
            authText.textContent = "Login / Signup";

            authLink.href = isInPagesFolder
                ? "admin-login.html?mode=user"
                : "pages/admin-login.html?mode=user";
        }
    }

    authLink.addEventListener("click", function (event) {
        if (sessionStorage.getItem("userToken")) {
            event.preventDefault();

            sessionStorage.removeItem("userToken");
            sessionStorage.removeItem("userData");

            updateAuthNavbar();
        }
    });

    updateAuthNavbar();
});
