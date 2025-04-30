"use strict";
import { fetchData } from './lib/fetchData.js';
import {fetchRoutes, directionsTo, getRouteSummaries} from './lib/hslReittiopas.js';

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
shoppingCartLink.addEventListener("click", async () => {
    const shoppingCart = document.getElementById("shopping-cart");
    shoppingCart.classList.toggle("show-shopping-cart");

    const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
    shoppingCartOverlay.classList.toggle("show-shopping-cart-overlay");

    if (shoppingCart.classList.contains("show-shopping-cart")) {
        document.body.style.overflow = "hidden";

        // Fetch items from localStorage
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const shoppingCartList = document.querySelector(".shopping-cart-list");
        shoppingCartList.innerHTML = ""; // Clear existing items

        let totalPrice = 0;

        for (const cartItem of cart) {
            try {

                const endpoint = cartItem.type === "meal" ? `${apiUrl}/meals/${cartItem.id}` : `${apiUrl}/items/${cartItem.id}`;
                const response = await fetch(endpoint);
                const item = await response.json();

                if (response.ok) {
                    const shoppingCartItem = document.createElement("div");
                    shoppingCartItem.className = "shopping-cart-item";
                    shoppingCartItem.setAttribute("data-item-id", item.id);
                    shoppingCartItem.innerHTML = `
                        <div class="shopping-cart-header">
                            <div class="shopping-cart-img">
                                <img src="${item.image_url}" alt="${item.name}">
                            </div>
                            <div class="shopping-cart-info">
                                <h4>${item.name}</h4>
                                <p id="shopping-cart-price">${(cartItem.quantity * item.price).toFixed(2)}€</p>
                            </div>
                        </div>
                        <div class="shopping-cart-options">
                            <button id="cart-btn-decrease">
                                <i class="fa-solid fa-minus"></i>
                            </button>
                            <p id="shopping-cart-amount">${cartItem.quantity}</p>
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

                    totalPrice += cartItem.quantity * item.price;
                } else {
                    console.warn(`Failed to fetch item with ID ${cartItem.id}`);
                }
            } catch (error) {
                console.error(`Error fetching item with ID ${cartItem.id}:`, error);
            }
        }

        // Update the total price
        const shoppingCartOrderTotal = document.querySelector("#shopping-cart-total");
        if (shoppingCartOrderTotal) {
            shoppingCartOrderTotal.textContent = `$${totalPrice.toFixed(2)}`;
        }

        // Update the navbar shopping cart total
        const navbarCartPrice = document.getElementById("navbar-cart-price");
        if (navbarCartPrice) {
            navbarCartPrice.textContent = `${totalPrice.toFixed(2)}€`;
        }
    } else {
        document.body.style.overflow = "";
    }
    toggleProceedButton();
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
    removeItemIdFromURL();
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

// Modify category button text to start with a capital letter and replace underscores with spaces
function formatCategoryText(text) {
    return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

// Fetch categories dynamically and populate buttons
async function populateCategories() {
    const data = await fetchData(`${apiUrl}/items`);

    // Extract unique categories from the data
    const categories = [...new Set(data.map(item => item.category))];

    // Get the category menu container
    const categoryMenu = document.querySelector('.restaurant-category-menu');

    // Clear existing buttons
    categoryMenu.innerHTML = '';

    // Add 'All' button
    const allButton = document.createElement('button');
    allButton.className = 'restaurant-category-item menu-active';
    allButton.textContent = 'All';
    allButton.addEventListener('click', () => filterMenuItems('All'));
    categoryMenu.appendChild(allButton);

    // Add buttons for each category
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'restaurant-category-item';
        button.textContent = formatCategoryText(category);
        button.addEventListener('click', () => filterMenuItems(category));
        categoryMenu.appendChild(button);
    });
}

// Filter menu items based on category
function filterMenuItems(category) {
    const restaurantMenuSection = document.querySelector('.restaurant-menu-section');
    restaurantMenuSection.innerHTML = ""; // Clear existing items

    fetchMenuItems().then(data => {
        const filteredItems = category === 'All' ? data : data.filter(item => item.category === category);

        filteredItems.forEach(item => {
            const restaurantCard = document.createElement('div');
            restaurantCard.className = 'restaurant-card';

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
                    <h2>${item.price}€</h2>
                    <i class="fa-solid fa-cart-shopping"></i>
                </div>
            `;

            restaurantMenuSection.appendChild(restaurantCard);

            restaurantCard.addEventListener('click', () => {
                displayRestaurantModal(item.id, item.type);
            });
        });
    });
}

// Add a new function to fetch and render meals from the API
async function renderMeals() {
    const data = await fetchData(`${apiUrl}/meals`);

    const restaurantMenuSection = document.querySelector(".restaurant-meals-section");

    // Create a new section for meals
    const mealsSection = document.createElement("div");
    mealsSection.className = "restaurant-meals-section";




    data.forEach((meal) => {
        const mealCard = document.createElement("div");
        mealCard.className = "restaurant-card";
        // Check localStorage for the quantity of this item
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const cartItem = cart.find(cartItem => cartItem.id === meal.id);
        const quantity = cartItem ? cartItem.quantity : 0;

        mealCard.innerHTML = `
            <div class="restaurant-card-image">
                <img src="./images/burgerfrommenu.png" alt="${meal.name}" draggable="false">
            </div>
            <div class="restaurant-card-header">
                <h2>${meal.name}</h2>
            </div>
            <div class="restaurant-card-description">
                <p>${meal.description}</p>
            </div>
            <div class="restaurant-card-price">
                <h2>${meal.price}€</h2>
                <i class="fa-solid fa-cart-shopping"></i>
                ${quantity > 0 ? `<span class="item-quantity">Quantity: ${quantity}</span>` : ""}
            </div>
        `;

        mealsSection.appendChild(mealCard);

        mealCard.addEventListener("click", () => {
            displayRestaurantModal(meal.id, "meal");
        });
    });

    restaurantMenuSection.appendChild(mealsSection);
}

// Call populateCategories and renderMeals on page load
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    renderMeals();
});

// Fetch datas
const apiUrl = "https://10.120.32.59/app/api/v1";
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
                // window.location.href = 'login-required.html';
            } else {
                // Redirect to the admin dashboard or another page
                // window.location.href = 'admin/menu.html';
            }
            loggedIn();
            window.location.reload();
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

const fetchMenuItemsById = async (id) => {
    const data = await fetchData(`${apiUrl}/items/${id}`);
    return data;
}

const fetchMenuMealsById = async (id) => {
    const data = await fetchData(`${apiUrl}/meals/${id}`);
    return data;
}

// console.log(fetchMenuItems());

async function handleItemIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('itemId');
    const mealId = urlParams.get('mealId');
  
    try {
      if (itemId) {
        // Fetch item details from items API
        const res = await fetch(`${apiUrl}/items/${itemId}`);
        const item = await res.json();
  
        if (res.ok) {
          console.log(item);
          displayRestaurantModal(item.id, item.type);
        } else {
          console.warn('Failed to fetch item by ID from URL.');
        }
      } else if (mealId) {
        // Fetch meal details from meals API
        const res = await fetch(`${apiUrl}/meals/${mealId}`);
        const meal = await res.json();
  
        if (res.ok) {
          console.log(meal);
          displayRestaurantModal(meal.id, meal.type); // Adjust type as needed
        } else {
          console.warn('Failed to fetch meal by ID from URL.');
        }
      }
    } catch (error) {
      console.error('Error fetching data from URL param:', error);
    }
  }
  
function updateItemIdInURL(itemId, type) {
    const url = new URL(window.location);
    if (type === 'item') {
        url.searchParams.set('itemId', itemId);
    }
    else if (type === 'meal') {
        url.searchParams.set('mealId', itemId);
    }
    url.hash = '#menu';
    window.history.pushState({}, '', url); 
    console.log('Item ID updated in URL with hash:', url);
}


function removeItemIdFromURL(type) {
    const url = new URL(window.location);
    url.searchParams.delete('itemId');
    url.searchParams.delete('mealId');
    window.history.pushState({}, '', url);
    console.log('Item ID parameter removed from URL');
}

  
async function renderRestaurantCard () {
    const data = await fetchMenuItems();

    const restaurantMenuSection = document.querySelector(".restaurant-menu-section");

    data.forEach((item) => {
        const restaurantCard = document.createElement("div");
        restaurantCard.className = "restaurant-card";

        // Check localStorage for the quantity of this item
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const cartItem = cart.find(cartItem => cartItem.id === item.id);
        const quantity = cartItem ? cartItem.quantity : 0;

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
                <h2>${item.price}€</h2>
                <i class="fa-solid fa-cart-shopping"></i>
                ${quantity > 0 ? `<span class="item-quantity">Quantity: ${quantity}</span>` : ""}
            </div>
        `;

        restaurantMenuSection.appendChild(restaurantCard);

        restaurantCard.addEventListener("click", () => {
            displayRestaurantModal(item.id, item.type);
        });
    });
}

const displayRestaurantModal = async (id, type) => {
    let data;

    if (type === 'item') {
        data = await fetchMenuItemsById(id);
    } else if (type === 'meal') {
        data = await fetchMenuMealsById(id);
    } else {
        throw new Error(`Unsupported type: ${type}`);
    }

    updateItemIdInURL(data.id, data.type);


    // console.log(`Clicked on ${item.name}`);
    
    const information = document.getElementById("information");
    information.classList.toggle("open-information-section");
    information.innerHTML = "";

    if (information.classList.contains("open-information-section")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }            

    let amount = 1;

    // change this line if the html information also changes. (not updated)
    const informationContainer = document.createElement("div");
    informationContainer.className = "information-container";
    informationContainer.innerHTML = `
        <div class="information-container">
            <div class="information-image">
                <img src="./images/burgerfrommenu.png" alt="${data.name}" draggable="false">
            </div>
            <div class="information-content">
                <div class="information-content-top">
                    <h1>${data.name}</h1>
                    <p>${data.price}€</p>
                </div>
                <div class="information-content-description">
                    <p>${data.description}</p>
                </div>
                <hr style="border-color: #949494">
                <div class="information-content-ingredients">
                    <p>Ingredients -<span>${data.ingredients}</span></p>
                </div>
                <div class="information-content-allergens">
                    <p>Allergens -<span style="background-color: #FFC94B">${data.allergens}</span></p>
                </div>
                <div class="information-content-size">
                    <p>Size -<span style="background-color: #FFC94B">${data.size}</span></p>
                </div>
            </div>
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
                    <p id="information-total-price">${(data.price * amount).toFixed(2)}€</p>
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

        totalPriceDisplay.textContent = `${(data.price * amount).toFixed(2)}€`;
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

        totalPriceDisplay.textContent = `${(data.price * amount).toFixed(2)}€`;
    });

    const buttonAddToCart = document.querySelector(".information-footer-add");
    buttonAddToCart.addEventListener("click", () => {
        const shoppingCartList = document.querySelector(".shopping-cart-list");

        let existingCartItem = shoppingCartList.querySelector(`[data-item-id="${data.id}"]`);
        if (existingCartItem) {
            const cartAmountDisplay = existingCartItem.querySelector("#shopping-cart-amount");
            const cartPriceDisplay = existingCartItem.querySelector("#shopping-cart-price");
            let currentAmount = parseInt(cartAmountDisplay.textContent, 10);
            currentAmount += amount;
            cartAmountDisplay.textContent = currentAmount;

            // Update the price for this specific item
            cartPriceDisplay.textContent = `${(currentAmount * data.price).toFixed(2)}€`;
            // alert("Item already in cart. Amount updated.");

            // Update localStorage
            const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
            const itemIndex = cart.findIndex(item => item.id === data.id);
            if (itemIndex !== -1) {
                cart[itemIndex].quantity = currentAmount;
            }
            localStorage.setItem("shoppingCart", JSON.stringify(cart));
        } else {
            let shoppingCartItem;
            shoppingCartItem = document.createElement("div");
            shoppingCartItem.className = "shopping-cart-item";
            shoppingCartItem.setAttribute("data-item-id", data.id);
            shoppingCartItem.innerHTML = `
                <div class="shopping-cart-header">
                    <div class="shopping-cart-img">
                        <img src="./images/burgerfrommenu.png" alt="${data.name}">
                    </div>
                    <div class="shopping-cart-info">
                        <h4>${data.name}</h4>
                        <p id="shopping-cart-price">${(amount * data.price).toFixed(2)}€</p>
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
            setupCartItemButtons(shoppingCartItem, data);

            // Add to localStorage
            const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
            cart.push({ id: data.id, quantity: amount, type: data.type }); // Include the type of the item
            localStorage.setItem("shoppingCart", JSON.stringify(cart));
        }
        updateCartTotal();
        removeInformationClasses();
    });

    const informationOverlay = document.getElementById("information-overlay");
    informationOverlay.classList.toggle("show-information-overlay");
} 

function setupCartItemButtons(cartItem, item) {
    const decreaseButton = cartItem.querySelector("#cart-btn-decrease");
    const increaseButton = cartItem.querySelector("#cart-btn-increase");
    const trashButton = cartItem.querySelector("#cart-btn-trash");
    const amountDisplay = cartItem.querySelector("#shopping-cart-amount");
    const priceDisplay = cartItem.querySelector("#shopping-cart-price");

    const updateRestaurantCardQuantity = (itemId, quantity, type) => {
        const restaurantCards = document.querySelectorAll(".restaurant-card");
        restaurantCards.forEach(card => {
            const cardName = card.querySelector(".restaurant-card-header h2").textContent;
            if (cardName === item.name && item.type === type) {
                const quantityDisplay = card.querySelector(".item-quantity");
                if (quantity > 0) {
                    if (!quantityDisplay) {
                        const newQuantityDisplay = document.createElement("span");
                        newQuantityDisplay.className = "item-quantity";
                        newQuantityDisplay.textContent = `Quantity: ${quantity}`;
                        card.querySelector(".restaurant-card-price").appendChild(newQuantityDisplay);
                    } else {
                        quantityDisplay.textContent = `Quantity: ${quantity}`;
                    }
                } else if (quantityDisplay) {
                    quantityDisplay.remove();
                }
            }
        });
    };

    // Increase button logic
    increaseButton.addEventListener("click", () => {
        let amount = parseInt(amountDisplay.textContent, 10);
        amount++;
        amountDisplay.textContent = amount;

        priceDisplay.textContent = `${(amount * item.price).toFixed(2)}€`;
        updateCartTotal();

        // Update localStorage
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const cartItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        if (cartItemIndex !== -1) {
            cart[cartItemIndex].quantity = amount;
        }
        localStorage.setItem("shoppingCart", JSON.stringify(cart));

        updateRestaurantCardQuantity(item.id, amount, item.type);
    });

    // Decrease button logic
    decreaseButton.addEventListener("click", () => {
        let amount = parseInt(amountDisplay.textContent, 10);
        if (amount > 1) {
            amount--;
            amountDisplay.textContent = amount;

            priceDisplay.textContent = `${(amount * item.price).toFixed(2)}€`;
            updateCartTotal();

            // Update localStorage
            const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
            const cartItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
            if (cartItemIndex !== -1) {
                cart[cartItemIndex].quantity = amount;
            }
            localStorage.setItem("shoppingCart", JSON.stringify(cart));

            updateRestaurantCardQuantity(item.id, amount, item.type);
        } else {
            cartItem.remove();
            updateCartTotal();

            // Remove item from localStorage
            const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
            const updatedCart = cart.filter(cartItem => cartItem.id !== item.id);
            localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));

            updateRestaurantCardQuantity(item.id, 0, item.type);
        }
    });

    // Trash button logic
    trashButton.addEventListener("click", () => {
        cartItem.remove();
        updateCartTotal();

        // Remove item from localStorage
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const updatedCart = cart.filter(cartItem => cartItem.id !== item.id);
        localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));

        updateRestaurantCardQuantity(item.id, 0, item.type);
    });
}

function toggleProceedButton() {
    console.log("toggleProceed function");
    const shoppingCartList = document.querySelector(".shopping-cart-list");
    const proceedButton = document.getElementById("shopping-cart-order");

    // Check if the shopping cart is empty
    if (shoppingCartList.children.length === 0) {
        proceedButton.disabled = true; // Disable the button
    } else {
        proceedButton.disabled = false; // Enable the button
    }
}

function updateCartTotal() {
    const shoppingCartList = document.querySelector(".shopping-cart-list");
    const cartItems = shoppingCartList.querySelectorAll(".shopping-cart-item");
    let totalPrice = 0;

    cartItems.forEach((item) => {
        // Extract the total price for this item directly from the #shopping-cart-price element
        const itemTotalPrice = parseFloat(item.querySelector("#shopping-cart-price").textContent.replace("€", ""));
        totalPrice += itemTotalPrice;
    });

    // Update the shopping cart total
    const shoppingCartOrderTotal = document.querySelector("#shopping-cart-total");
    if (shoppingCartOrderTotal) {
        shoppingCartOrderTotal.textContent = `${totalPrice.toFixed(2)}€`;
    }

    // Update the navbar shopping cart total
    const navbarCartPrice = document.getElementById("navbar-cart-price");
    if (navbarCartPrice) {
        navbarCartPrice.textContent = `${totalPrice.toFixed(2)}€`;
    }
    renderRestaurantCard();
    toggleProceedButton();
}

renderRestaurantCard();

const informationOverlay = document.getElementById("information-overlay");
informationOverlay.addEventListener("click",  removeInformationClasses);

document.addEventListener("DOMContentLoaded", () => {
    handleItemIdFromURL();
    loggedIn();

    // Update shopping cart on page load
    const shoppingCartLink = document.getElementById("navbar-shopping-cart");
    if (shoppingCartLink) {
        shoppingCartLink.click(); // Trigger the shopping cart logic to update
        shoppingCartLink.click(); // Close it back to its original state
    }
});

// Logged in setup
// const getUserByToken = async () => {
//     const data = fetchData(`${apiUrl}/items`)
//     console.log(data);
// }

// getUserByToken();

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

            circle.bindTooltip(`<b>${name}</b>`, {
                permanent: false, // Tooltip only shows on hover
                direction: 'top', // Tooltip appears above the circle
                offset: [0, -10], // Adjust the position of the tooltip
            });

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
            circle.on("click", async () => {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const fromLat = position.coords.latitude;
                    const fromLon = position.coords.longitude;
                    const toLat = lat;
                    const toLon = lon;

                    try {
                        const summaries = await getRouteSummaries(fromLat, fromLon, toLat, toLon);
                        console.log(summaries.join("\n\n")); // Display the summaries in the console or UI
                    } catch (error) {
                        console.error("Error displaying route summaries:", error);
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

let currentPolyline = null; // Store the currently drawn polyline

async function decodePolylineFromItineraries(fromLat, fromLon, toLat, toLon) {
    try {
        const data = await directionsTo(fromLat, fromLon, toLat, toLon);
        const edges = data?.data?.planConnection?.edges;

        if (edges && edges.length > 0) {
            // Find the shortest connection based on duration
            const shortestConnection = edges.reduce((shortest, current) => {
                return current.node.duration < shortest.node.duration ? current : shortest;
            });

            console.log('Shortest Connection:', shortestConnection);

            // Remove the previously drawn polyline if it exists
            if (currentPolyline) {
                map.removeLayer(currentPolyline);
            }

            // Decode and draw the polyline for the shortest connection
            const decodedPoints = shortestConnection.node.legs.flatMap((leg) => {
                return leg.legGeometry && leg.legGeometry.points
                    ? polyline.decode(leg.legGeometry.points)
                    : [];
            });

            if (decodedPoints.length > 0) {
                currentPolyline = L.polyline(decodedPoints, {
                    color: 'blue', // Set the color of the line
                    weight: 4,     // Set the thickness of the line
                    opacity: 0.7   // Set the opacity of the line
                }).addTo(map);
            } else {
                console.log('No valid geometry found for the shortest connection.');
            }
        } else {
            console.error('No connections found in the response.');
        }
    } catch (error) {
        console.error('Error decoding polyline:', error);
    }
}