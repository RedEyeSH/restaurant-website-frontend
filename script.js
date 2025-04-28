"use strict";
import { fetchData } from './lib/fetchData.js';
import { fetchRoutes, directionsTo } from './lib/hslReittiopas.js';


// Simple call to fetchRoutes
fetchRoutes().then(data => console.log('Fetched routes:', data));
directionsTo().then(data => console.log('Directions:', data));

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

    if (shoppingCart.classList.contains("show-shopping-cart")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }
});

function closeShoppingCart() {
    const shoppingCart = document.getElementById("shopping-cart");
    shoppingCart.classList.remove("show-shopping-cart");

    const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
    shoppingCartOverlay.classList.remove("show-shopping-cart-overlay");

    document.body.style.overflow = "";
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

function removeInformationClasses() {
    const information = document.getElementById("information");
    information.classList.remove("open-information-section");

    const informationOverlay = document.getElementById("information-overlay");
    informationOverlay.classList.remove("show-information-overlay");

    document.body.style.overflow = "";
}

const close_form = document.querySelectorAll("#x-close-form");
close_form.forEach((button) => {
    button.addEventListener("click", closeForms);
});

const close_form_overlay = document.getElementById("box-overlay");
close_form_overlay.addEventListener("click", closeForms)

// Restaurant menu cards
const restaurant_container = document.getElementById("");

// Restaurant menu link
const restaurantItems = document.querySelectorAll(".restaurant-category-item");
restaurantItems.forEach((item) => {
    item.addEventListener("click", () => {
        restaurantItems.forEach(button => button.classList.remove("menu-active"));
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

const fetchMenuItems = async () => {
    const data = await fetchData(`${apiUrl}/items`);
    return data;
}

// console.log(fetchMenuItems());

const renderRestaurantCard = async () => {
    const data = await fetchMenuItems();
    // console.log(data);

    const restaurantMenuSection = document.querySelector(".restaurant-menu-section");

    data.forEach((item) => {
        const restaurantCard = document.createElement("div");
        restaurantCard.className = "restaurant-card";
        
        restaurantCard.innerHTML = `
            <div class="restaurant-card-image">
                <img src="./images/burgerfrommenu.png" alt="${item.name}" draggable="false">
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

        restaurantCard.addEventListener("click", () => {
            console.log(`Clicked on ${item.name}`);
            
            const information = document.getElementById("information");
            information.classList.toggle("open-information-section");
            information.innerHTML = "";

            if (information.classList.contains("open-information-section")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }            

            let amount = 1;

            console.log(amount)

            // change this line if the html information also changes. (not updated)
            const informationContainer = document.createElement("div");
            informationContainer.className = "information-container";
            informationContainer.innerHTML = `
                <div class="information-container">
                    <div class="information-image">
                        <img src="./images/burgerfrommenu.png" alt="${item.name}" draggable="false">
                    </div>
                    <div class="information-content">
                        <div class="information-content-top">
                            <h1>${item.name}</h1>
                            <p>$${item.price}</p>
                        </div>
                        <div class="information-content-description">
                            <p>${item.description}</p>
                        </div>
                    </div>
                    <hr style="border-color: #949494">
                    <div class="information-footer">
                        <div class="information-footer-amount">
                            <button id="information-amount-btn-decrease" ${amount == 1 ? "disabled" : ""}>
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <p id="information-amount-display">${amount}</p>
                            <button id="information-amount-btn-increase">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <div class="information-footer-add">
                            <p>Add to Cart</p>
                            <p id="information-total-price">$${(item.price * amount).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;

            information.appendChild(informationContainer);

            const decreaseButton = informationContainer.querySelector("#information-amount-btn-decrease");
            const increaseButton = informationContainer.querySelector("#information-amount-btn-increase");
            const amountDisplay = informationContainer.querySelector("#information-amount-display");
            const totalPriceDisplay = informationContainer.querySelector("#information-total-price");

            increaseButton.addEventListener("click", () => {
                amount++;
                amountDisplay.textContent = amount;

                if (amount > 1) {
                    decreaseButton.disabled = false;
                    decreaseButton.style.cursor = "pointer";
                }

                totalPriceDisplay.textContent = `$${(item.price * amount).toFixed(2)}`;
            });

            decreaseButton.addEventListener("click", () => {
                if (amount > 1) {
                    amount--;
                    amountDisplay.textContent = amount;
                }

                if (amount === 1) {
                    decreaseButton.disabled = true;
                    decreaseButton.style.cursor = "not-allowed";
                }

                totalPriceDisplay.textContent = `$${(item.price * amount).toFixed(2)}`;
            });

            //
            const buttonAddToCart = document.querySelector(".information-footer-add");
            buttonAddToCart.addEventListener("click", () => {
                const shoppingCartList = document.querySelector(".shopping-cart-list");
            
                let existingCartItem = shoppingCartList.querySelector(`[data-item-id="${item.id}"]`);
                if (existingCartItem) {
                    const cartAmountDisplay = existingCartItem.querySelector("#shopping-cart-amount");
                    const cartPriceDisplay = existingCartItem.querySelector("#shopping-cart-price");
                    let currentAmount = parseInt(cartAmountDisplay.textContent, 10);
                    currentAmount += amount;
                    cartAmountDisplay.textContent = currentAmount;
            
                    // Update the price for this specific item
                    cartPriceDisplay.textContent = `$${(currentAmount * item.price).toFixed(2)}`;
                } else {
                    let shoppingCartItem;
                    shoppingCartItem = document.createElement("div");
                    shoppingCartItem.className = "shopping-cart-item";
                    shoppingCartItem.setAttribute("data-item-id", item.id);
                    shoppingCartItem.innerHTML = `
                        <div class="shopping-cart-header">
                            <div class="shopping-cart-img">
                                <img src="./images/burgerfrommenu.png" alt="${item.name}">
                            </div>
                            <div class="shopping-cart-info">
                                <h4>${item.name}</h4>
                                <p id="shopping-cart-price">$${(amount * item.price).toFixed(2)}</p>
                            </div>
                        </div>
                        <div class="shopping-cart-options">
                            <button id="cart-btn-decrease">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <p id="shopping-cart-amount">${amount}</p>
                            <button id="cart-btn-increase">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                            <button id="cart-btn-trash">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `;
            
                    shoppingCartList.appendChild(shoppingCartItem);
                    setupCartItemButtons(shoppingCartItem, item);
                }
                updateCartTotal();
                removeInformationClasses();
            });

            const informationOverlay = document.getElementById("information-overlay");
            informationOverlay.classList.toggle("show-information-overlay");
        });
    });
}

function setupCartItemButtons(cartItem, item) {
    const decreaseButton = cartItem.querySelector("#cart-btn-decrease");
    const increaseButton = cartItem.querySelector("#cart-btn-increase");
    const trashButton = cartItem.querySelector("#cart-btn-trash");
    const amountDisplay = cartItem.querySelector("#shopping-cart-amount");
    const priceDisplay = cartItem.querySelector("#shopping-cart-price");

    // Increase button logic
    increaseButton.addEventListener("click", () => {
        let amount = parseInt(amountDisplay.textContent, 10);
        amount++;
        amountDisplay.textContent = amount;

        priceDisplay.textContent = `$${(amount * item.price).toFixed(2)}`;
        updateCartTotal();
    });

    // Decrease button logic
    decreaseButton.addEventListener("click", () => {
        let amount = parseInt(amountDisplay.textContent, 10);
        if (amount > 1) {
            amount--;
            amountDisplay.textContent = amount;

            priceDisplay.textContent = `$${(amount * item.price).toFixed(2)}`;
            updateCartTotal();
        } else {
            cartItem.remove();
            updateCartTotal();
        }
    });

    // Trash button logic
    trashButton.addEventListener("click", () => {
        cartItem.remove();
        updateCartTotal();
    });
}

function updateCartTotal() {
    const shoppingCartList = document.querySelector(".shopping-cart-list");
    const cartItems = shoppingCartList.querySelectorAll(".shopping-cart-item");
    let totalPrice = 0;

    cartItems.forEach((item) => {
        // Extract the total price for this item directly from the #shopping-cart-price element
        const itemTotalPrice = parseFloat(item.querySelector("#shopping-cart-price").textContent.replace("$", ""));
        totalPrice += itemTotalPrice;
    });

    // Update the shopping cart total
    const shoppingCartOrderTotal = document.querySelector("#shopping-cart-total");
    if (shoppingCartOrderTotal) {
        shoppingCartOrderTotal.textContent = `$${totalPrice.toFixed(2)}`;
    }

    // Update the navbar shopping cart total
    const navbarCartPrice = document.getElementById("navbar-cart-price");
    if (navbarCartPrice) {
        navbarCartPrice.textContent = `$${totalPrice.toFixed(2)}`;
    }
}

renderRestaurantCard();

const displayInformation = async () => {

}
// Initialize the Leaflet map
let map; // Declare map in a higher scope

function initMap() {
    const location = [60.22487539389367, 25.07793846566476];
    map = L.map('map-container').setView(location, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    drawStopsOnMap(map)
}

async function drawStopsOnMap(map) {
    try {
        const stops = await fetchRoutes(); // Get stops from hslReittiopas.js

        stops.forEach(({ lat, lon, name }) => {
            const circle = L.circle([lat, lon], {
                color: 'green',
                fillColor: '#32CD32',
                fillOpacity: 0.5,
                radius: 50,
            }).addTo(map);

            circle.bindPopup(`<b>${name}</b>`);

            // Add click event to get directions
            circle.on('click', () => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const fromLat = position.coords.latitude;
                    const fromLon = position.coords.longitude;
                    const toLat = lat;
                    const toLon = lon;

                    try {
                        const itineraries = await directionsTo(fromLat, fromLon, toLat, toLon);
                        console.log('Itineraries:', itineraries);
                        console.log(decodePolylineFromItineraries(fromLat, fromLon, toLat, toLon));
                    } catch (error) {
                        console.error('Error fetching directions:', error);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error drawing stops on map:', error);
    }
}

initMap();
console.log(map)
// Users current location
navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
});

async function decodePolylineFromItineraries(fromLat, fromLon, toLat, toLon) {
    try {
        const data = await directionsTo(fromLat, fromLon, toLat, toLon);
        const itineraries = data?.data?.plan?.itineraries;

        if (itineraries) {
            itineraries.forEach((itinerary, index) => {
                console.log(`Itinerary ${index + 1}:`);

                itinerary.legs.forEach((leg, legIndex) => {
                    if (leg.legGeometry && leg.legGeometry.points) {
                        const decodedPoints = polyline.decode(leg.legGeometry.points);
                        console.log(`  Leg ${legIndex + 1} Decoded Points:`, decodedPoints);
                        const polylineLayer = L.polyline(decodedPoints, {
                            color: 'blue', // Set the color of the line
                            weight: 4,     // Set the thickness of the line
                            opacity: 0.7   // Set the opacity of the line
                        }).addTo(map);
                    } else {
                        console.log(`  Leg ${legIndex + 1} has no geometry.`);
                    }
                });
            });
        } else {
            console.error('No itineraries found in the response.');
        }
    } catch (error) {
        console.error('Error decoding polyline:', error);
    }
}

const informationOverlay = document.getElementById("information-overlay");
informationOverlay.addEventListener("click",  removeInformationClasses);
// displayMenuItems();