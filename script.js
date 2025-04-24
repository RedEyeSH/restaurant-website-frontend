"use strict";
import { fetchData } from './lib/fetchData.js';

// Smooth scrolling for navbar links
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();

        const targetId = link.getAttribute('href').substring(1); // Get the target section ID
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Login
const navbar_login = document.getElementById("navbar-login");
navbar_login.addEventListener('click', () => {
    document.getElementById("account").classList.toggle("open-account-section");
    document.getElementById("account-container").classList.toggle("account-container-form");

    document.getElementById("box-overlay").classList.toggle("show-box-overlay");
});

const loginForgotPassword = document.getElementById("login-forgot-password");
loginForgotPassword.addEventListener("click", () => {
    const loginForm = document.getElementById("login-form");
    const forgotPasswordForm = document.getElementById("forgot-password-form");

    loginForm.classList.toggle("close-login-form-forgot");
    forgotPasswordForm.classList.toggle("show-forgot-password-form");
});

const loginForgotBack = document.getElementById("forgot-back-to-login");
loginForgotBack.addEventListener("click", () => {
    const loginForm = document.getElementById("login-form");
    const forgotPasswordForm = document.getElementById("forgot-password-form");

    loginForm.classList.remove("close-login-form-forgot");
    forgotPasswordForm.classList.remove("show-forgot-password-form");
});

const signupLink = document.getElementById("signup");
signupLink.addEventListener('click', () => {
    document.getElementById("login-form").classList.toggle("close-login-form");
    document.getElementById("signup-form").classList.toggle("show-signup-form");
});

const loginLink = document.getElementById("login")
loginLink.addEventListener('click', () => {
    document.getElementById("login-form").classList.remove("close-login-form");
    document.getElementById("signup-form").classList.remove("show-signup-form");
});

// Shopping cart side bar
const shoppingCartLink = document.getElementById("navbar-shopping-cart");
shoppingCartLink.addEventListener("click", () => {
    const shoppingCart = document.getElementById("shopping-cart");
    shoppingCart.classList.toggle("show-shopping-cart");

    const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
    shoppingCartOverlay.classList.toggle("show-shopping-cart-overlay");
});

function closeShoppingCart() {
    const shoppingCart = document.getElementById("shopping-cart");
    shoppingCart.classList.remove("show-shopping-cart");

    const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
    shoppingCartOverlay.classList.remove("show-shopping-cart-overlay");
}

const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
shoppingCartOverlay.addEventListener("click", closeShoppingCart);

// Handling for closing forms
function closeForms() {
    document.getElementById("box-overlay").classList.remove("show-box-overlay");
    document.getElementById("account-container").classList.remove("account-container-form");
    document.getElementById("account").classList.remove("open-account-section");

    // document.getElementById("login-form").classList.remove("close-login-form");
    // document.getElementById("login-form").classList.remove("show-login-form");
    // document.getElementById("signup-form").classList.remove("show-signup-form");
}

const close_form = document.querySelectorAll("#x-close-form");
close_form.forEach((button) => {
    button.addEventListener('click', closeForms);
});

const close_form_ = document.getElementById("box-overlay");
close_form_.addEventListener('click', closeForms)

// Restaurant menu cards
const restaurant_container = document.getElementById("");

// Restaurant menu link
const restaurantItems = document.querySelectorAll(".restaurant-category-item");
restaurantItems.forEach((item) => {
  item.querySelector("p").addEventListener("click", () => {
    restaurantItems.forEach(div => div.classList.remove("menu-active"));
    item.classList.add("menu-active");
  });
});

// Fetch datas
const apiUrl = "https://10.120.32.59/app/api/v1";

// const getUserByToken = async () => {
//     const data = fetchData(`${apiUrl}/items`)
//     console.log(data);
// }

// getUserByToken();

console.log(apiUrl);

// Login form handling
const loginForm = document.querySelector(".login-form form");
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent the default form submission

    // Get the form data
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Prepare the data to be sent to the backend
    const formData = {
        email: email,
        password: password
    };

    try {
        // Send POST request to backend
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            // Store the JWT token for future requests
            localStorage.setItem('authToken', data.token);
            const token = localStorage.getItem('authToken');
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token (base64)
            const role = decodedToken.role;

            if (role !== 'admin') {
                // If the role is not 'admin', redirect to a general page or login
                window.location.href = 'login-required.html';
            } else {
                // Redirect to the admin dashboard or another page
                window.location.href = 'admin/menu.html';
            }
        } else {
            alert(data.message || 'An error occurred during login.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your login.');
    }
});

// Sign up form handling
const signupForm = document.querySelector(".signup-form form");
signupForm.addEventListener('submit', async function(event) {
    event.preventDefault();  // Prevent the default form submission

    // Get the form data
    const email = document.getElementById("signup-email").value;
    const name = document.getElementById("signup-name").value;
    const password = document.getElementById("signup-password").value;
    const retypePassword = document.getElementById("signup-password-confirmation").value;

    // Validate passwords match
    if (password !== retypePassword) {
        alert("Passwords don't match.");
        return;
    }

    // Prepare the data to be sent to the backend
    const formData = {
        email: email,
        name: name,
        password: password,
        retype_password: retypePassword
    };

    try {
        // Send POST request to backend
        const response = await fetch(`${apiUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please check your email to verify your account.');
            // window.location.href = 'login.html';  // Redirect to login page after successful registration
        } else {
            alert(data.message || 'An error occurred during registration.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your request.');
    }
});

// Forgot password handling
const forgotPasswordForm = document.querySelector(".forgot-password-form form");
console.log(forgotPasswordForm)
forgotPasswordForm.addEventListener("submit", async function(event) {
    event.preventDefault();  // Prevent the default form submission

    const email = document.getElementById("forgot-password-email").value;
    const message = document.getElementById("forgot-password-message");
    console.log(email)
    try {
        // Send POST request to backend to initiate the password reset process
        const response = await fetch(`${apiUrl}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        console.log(data);

        if (response.ok) {
            message.textContent = "Password reset link sent to your email!";
            message.style.color = 'green';
        } else {
            message.textContent = data.message || "An error occurred.";
            message.style.color = 'red';
        }
    } catch (error) {
        console.error('Error:', error);
        message.textContent = 'An error occurred while processing your request.';
        message.style.color = 'red';
    }
});

const getMenuItems = async () => {
    const data = await fetchData(`${apiUrl}/items`);
    return data;
}

console.log(getMenuItems());

const createRestaurantCard = async () => {
    const data = await getMenuItems();
    // console.log(data);

    const restaurantMenuSection = document.querySelector(".restaurant-menu-section");

    data.forEach((item) => {
        const restaurantCard = document.createElement("div");
        restaurantCard.className = "restaurant-card";
        
        restaurantCard.innerHTML = `
            <div class="restaurant-card-image">
                <img src="${item.image_url}" alt="${item.name}">
            </div>
            <div class="restaurant-card-header">
                <h2>${item.name}</h2>
            </div>
            <div class="restaurant-card-description">
                <p>${item.description}</p>
            </div>
            <div class="restaurant-card-price">
                <h2>$${item.price}</h2>
                <i class="fa-solid fa-cart-shopping"></i>
            </div>
        `;
        // console.log(item.image_url);
        restaurantMenuSection.appendChild(restaurantCard);
    });

}

createRestaurantCard();

// displayMenuItems();