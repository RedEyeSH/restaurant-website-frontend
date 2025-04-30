"use strict";

const sections = document.querySelectorAll(".container section");
const navigationLinks = document.querySelectorAll(".navigation-link");

navigationLinks.forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Remove 'link-active' from all links
        navigationLinks.forEach(nav => nav.classList.remove("link-active"));

        // Add 'link-active' to the clicked link
        event.currentTarget.classList.add("link-active");

        // Get the section ID from the link's ID (e.g., 'account-link' -> 'profile')
        const sectionId = event.currentTarget.id.replace("-link", "");

        // Hide all sections and show the corresponding section
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.remove("fade-out");
                section.classList.add("fade-in");
                section.style.display = "block";
            } else {
                section.classList.remove("fade-in");
                section.classList.add("fade-out");
            }
            closeNavigation();
            section.style.display = section.id === sectionId ? "block" : "none";
        });
    });
});

const navigation = document.querySelector(".navigation");
const navbarOverlay = document.querySelector(".navbar-overlay");
function closeNavigation() {
    navigation.classList.remove("open");
    navbarOverlay.classList.remove("open");
}

const orderPopup = document.querySelector(".order-popup");
const orderPopupOverlay = document.querySelector(".order-popup-overlay");
function closeOrderPopup() {
    orderPopup.classList.remove("open");
    orderPopupOverlay.classList.remove("open");
}

const menuToggle = document.querySelector(".menu-toggle");

menuToggle.addEventListener("click", () => {
    navigation.classList.toggle("open");
    navbarOverlay.classList.toggle("open");
});

navbarOverlay.addEventListener("click", () => {
    closeNavigation();
});

const apiUrl = "https://10.120.32.59/app/api/v1";

const fetchCurrentUser = async () => {
    try {
        const response = await fetch(`${apiUrl}/users/token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch current user');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching current user:', error);
    }
}

const displayUserData = async () => {
    const data = await fetchCurrentUser();

    const profileUsername = document.getElementById("profile-username");
    profileUsername.textContent = `Welcome back, ${data.name}!`;

    const usernameInput = document.getElementById("username");
    usernameInput.value = data.name;

    const emailInput = document.getElementById("email");
    emailInput.value = data.email;
}

displayUserData();

const profileForm = document.querySelector(".profile-form");
const saveButton = document.querySelector(".save-btn");

// Function to check if all inputs have values
const checkFormInputs = () => {
    const inputs = profileForm.querySelectorAll("input");
    let allFilled = true;

    inputs.forEach(input => {
        if (input.value.trim() === "") {
            allFilled = false;
        }
    });

    // Enable or disable the save button based on input values
    saveButton.disabled = !allFilled;
};

// Add event listeners to all input fields
profileForm.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", checkFormInputs);
});

// Initial check to disable the button if inputs are empty on page load
checkFormInputs();

const serviceForm = document.querySelector(".service-form");
const serviceButton = document.querySelector(".service-btn");

// Function to check if all inputs in the service form have values
const checkServiceFormInputs = () => {
    const inputs = serviceForm.querySelectorAll("input, textarea");
    let allFilled = true;

    inputs.forEach(input => {
        if (input.value.trim() === "") {
            allFilled = false;
        }
    });

    // Enable or disable the service button based on input values
    serviceButton.disabled = !allFilled;
};

// Add event listeners to all input fields in the service form
serviceForm.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", checkServiceFormInputs);
});

// Initial check to disable the button if inputs are empty on page load
checkServiceFormInputs();

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
    localStorage.removeItem("authToken");
    window.location.href = "/index.html";
});

const fetchOrderHistory = async () => {
    const userData = await fetchCurrentUser();

    try {
        const response = await fetch(`${apiUrl}/orders/user/${userData.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user's ordered data.");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching user's ordered data:", error);
    }
}

const displayOrderHistory = async () => {
    const orderedData = await fetchOrderHistory();
    // console.log(orderedData);

    const orderHistory = document.querySelector(".order-history");

    for (const data of orderedData) {
        const orderItem = document.createElement("div");
        orderItem.className = "order-item";
        orderItem.setAttribute("data-id", data.order_id);
        orderItem.innerHTML = `
            <button class="order-info">
                <p>#${data.order_id}</p>
                <p>${data.total_price} €</p>
            </button>
            <div class="order-date">
                <p>${data.created_at}</p>
            </div>
        `;

        orderHistory.appendChild(orderItem);

        orderItem.addEventListener("click", () => {
            orderHistoryPopup(orderItem, data);
        });
    }
}

displayOrderHistory();

const orderHistoryPopup = (item, data) => {
    console.log(item);
    console.log(data);
    orderPopupOverlay.classList.toggle("open");
    orderPopup.classList.toggle("open");

    orderPopup.innerHTML = "";

    const orderPopupItem = document.createElement("div");
    orderPopupItem.className = "order-popup-item";
    orderPopupItem.innerHTML = `
        <div class="order-popup-header">
            <h1>#${data.order_id}</h1>
            <i class="fa-solid fa-xmark" id="x-order"></i>
        </div>
    `;

    orderPopup.appendChild(orderPopupItem);

    const xOrder = document.getElementById("x-order");
    xOrder.addEventListener("click", () => {
        closeOrderPopup();
    });
}

orderPopupOverlay.addEventListener("click", () => {
    console.log("overlay");
    closeOrderPopup();
});