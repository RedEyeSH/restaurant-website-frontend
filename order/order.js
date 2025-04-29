document.addEventListener("DOMContentLoaded", () => {
    loggedIn();
});

const loggedIn = () => {
    const navbarActions = document.querySelector(".navbar-actions");
    const navbarLogin = document.getElementById("navbar-login");

    const token = localStorage.getItem("authToken");

    if (token) {
        const navbarLoggedIn = document.createElement("div");
        navbarLoggedIn.className = "navbar-logged-in";
        navbarLoggedIn.setAttribute("id", "navbar-logged-in");

        navbarLoggedIn.innerHTML = `
            <a href="/profile/profile.html">${"username"}</a>
        `;

        navbarLogin.remove();
        navbarActions.appendChild(navbarLoggedIn);
    }
}

