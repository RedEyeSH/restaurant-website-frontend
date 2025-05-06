"use strict";
import { fetchData } from './lib/fetchData.js';
import {fetchRoutes, directionsTo, getRouteSummaries} from './lib/hslReittiopas.js';

// Simple call to fetchRoutes
fetchRoutes().then(data => console.log('Fetched routes:', data));
directionsTo().then(data => console.log('Directions:', data));

// Smooth scrolling for navbar links
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Check if the href starts with '#' (indicating an in-page anchor link)
        if (href.startsWith('#')) {
            e.preventDefault(); // Prevent default behavior for in-page links

            const targetId = href.substring(1); // Get the target section ID
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

let isAdmin;

const loggedIn = async () => {
    const token = localStorage.getItem("authToken");

    let userData;
    if (token) {
        userData = await getUserByToken(token);
    }

    const navbarActions = document.querySelector(".navbar-actions");
    const navbarLogin = document.getElementById("navbar-login");

    if (userData) {
        
        if (userData.role === "admin") {
            isAdmin = true;
        } else {
            isAdmin = false;
        }
        const navbarLoggedIn = document.createElement("div");
        navbarLoggedIn.className = "navbar-logged-in";
        navbarLoggedIn.setAttribute("id", "navbar-logged-in");

        navbarLoggedIn.innerHTML = `
            <a href="/profile/profile.html">${userData.name} ${isAdmin ? '<i class="fa fa-shield" style="margin-left: 6px; color: gold;"></i>' : ''}</a>
        `;

        navbarLogin.remove();
        navbarActions.appendChild(navbarLoggedIn);
     }
}

// What else we got to do?
// is the favourite heart icon working?
// No I don't think so. I will look into it again. I can focus on it
/*
    alright, i will do responsive web design for other pages. 
    if needed and also i'm thinking about adding more animations
*/
// Alright. We will decide more at 9
// Alright sounds cool. Maybe we can try to add a video also instead of the main image in front of the page.
// yeah sure 
// nice x2
let lastScrollPosition = 0;
const navbar = document.querySelector(".navbar");
const mobileSidebar = document.querySelector(".mobile-sidebar");
const shoppingCart = document.getElementById("shopping-cart");

window.addEventListener("scroll", () => {
    const currentScrollPosition = window.pageYOffset; // Get the current scroll position
    const navbarHeight = navbar.offsetHeight; // Dynamically get the navbar's height
    const scrollThreshold = navbarHeight; // Use the navbar's height as the threshold

    if (currentScrollPosition > scrollThreshold) {
        // Only hide/show the navbar if the user has scrolled past the threshold
        if (currentScrollPosition > lastScrollPosition) {
            // Scrolling down
            navbar.style.transform = `translateY(-${navbarHeight}px)`; // Hide the navbar completely
            mobileSidebar.style.top = "0"; // Move the mobile-sidebar to the top
            shoppingCart.style.top = "0"; // Move the shopping cart to the top
            shoppingCart.style.paddingBottom = "0px";
        } else {
            // Scrolling up
            navbar.style.transform = "translateY(0)"; // Show the navbar fully
            mobileSidebar.style.top = `${navbarHeight}px`; // Move the mobile-sidebar back below the navbar
            shoppingCart.style.top = `${navbarHeight}px`; // Move the shopping cart back below the navbar
            shoppingCart.style.paddingBottom = "110px";
        }
    } else {
        // If the user is at the top of the page, ensure the navbar, mobile-sidebar, and shopping cart are fully visible
        navbar.style.transform = "translateY(0)";
        mobileSidebar.style.top = `${navbarHeight}px`;
        shoppingCart.style.top = `${navbarHeight}px`;
        shoppingCart.style.paddingBottom = "110px";
    }

    lastScrollPosition = currentScrollPosition; // Update the last scroll position
});

// Login
const navbar_login = document.getElementById("navbar-login");
navbar_login.addEventListener('click', () => {
    document.getElementById("account").classList.toggle("open-account-section");
    document.getElementById("account-container").classList.toggle("account-container-form");

    document.getElementById("box-overlay").classList.toggle("show-box-overlay");
});

const navbarMobileLink = document.querySelector(".navbar-mobile-link");
navbarMobileLink.addEventListener("click", () => {
    closeShoppingCart();
    const mobileSidebar = document.querySelector(".mobile-sidebar");
    mobileSidebar.classList.toggle("open");

    const googleTranslateElement = document.getElementById("google_translate_element");
    if (mobileSidebar.classList.contains("open")) {
        mobileSidebar.querySelector(".sidebar-link").appendChild(googleTranslateElement);
    } else {
        document.querySelector(".navbar-actions").appendChild(googleTranslateElement);
    }
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
    closeMobileSidebar();
    const shoppingCart = document.getElementById("shopping-cart");
    shoppingCart.classList.toggle("show-shopping-cart");

    const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
    shoppingCartOverlay.classList.toggle("show-shopping-cart-overlay");

    if (shoppingCart.classList.contains("show-shopping-cart")) {
        document.body.style.overflow = "hidden";

        // Fetch items from localStorage
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const shoppingCartList = document.querySelector(".shopping-cart-list");
        // shoppingCartList.innerHTML = ""; // Clear existing items

        const cartItems = shoppingCartList.querySelectorAll(".shopping-cart-item");
        cartItems.forEach(item => item.remove());

        let totalPrice = 0;

        for (const cartItem of cart) {
            try {
                const endpoint = cartItem.type === "meal" ? `${apiUrl}/meals/${cartItem.id}` : `${apiUrl}/items/${cartItem.id}`;
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
                    }
                });
                const item = await response.json();

                if (response.ok) {
                    const shoppingCartItem = document.createElement("div");
                    shoppingCartItem.className = "shopping-cart-item";
                    shoppingCartItem.setAttribute("data-item-id", item.id);
                    shoppingCartItem.innerHTML = `
                        <div class="shopping-cart-header">
                            <div class="shopping-cart-img">
                                <img src="https://10.120.32.59/app/${item.image_url}" alt="${item.name}">
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

function closeMobileSidebar() {
    const mobileSidebar = document.querySelector(".mobile-sidebar");
    mobileSidebar.classList.remove("open");
}

function closeShoppingCart() {
    const shoppingCart = document.getElementById("shopping-cart");
    shoppingCart.classList.remove("show-shopping-cart");

    const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
    shoppingCartOverlay.classList.remove("show-shopping-cart-overlay");

    document.body.style.overflow = "";
}

const shoppingCartOverlay = document.querySelector(".shopping-cart-overlay");
shoppingCartOverlay.addEventListener("click", closeShoppingCart);

const xCloseCart = document.getElementById("x-close-cart");
xCloseCart.addEventListener("click", closeShoppingCart);

const xCloseMobileSidebar = document.getElementById("x-close-sidebar");
xCloseMobileSidebar.addEventListener("click", closeMobileSidebar);

// Handling for closing forms
function closeForms() {
    document.getElementById("box-overlay").classList.remove("show-box-overlay");
    document.getElementById("account-container").classList.remove("account-container-form");
    document.getElementById("account").classList.remove("open-account-section");
}

function removeInformationClasses() {
    removeItemIdFromURL();
    const information = document.getElementById("information");
    information.classList.remove("open-information-section");

    const informationOverlay = document.getElementById("information-overlay");
    informationOverlay.classList.remove("show-information-overlay");

    document.body.style.overflow = "";
}

function removeSearchClasses() {
    const searchResultsContainer = document.getElementById("search-results");
    searchResultsContainer.classList.remove("active");

    const searchOverlay = document.querySelector(".search-overlay");
    searchOverlay.classList.remove("active");

    document.body.style.overflow = "";
}

const close_form = document.querySelectorAll(".x-close-form");
close_form.forEach((button) => {
    button.addEventListener("click", closeForms);
});

const close_form_overlay = document.getElementById("box-overlay");
close_form_overlay.addEventListener("click", closeForms)

const closeSearchOverlay = document.querySelector(".search-overlay");
closeSearchOverlay.addEventListener("click", removeSearchClasses)

// Modify category button text to start with a capital letter and replace underscores with spaces
const formatCategoryText = (text) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

// Consolidate renderRestaurantCard and filterMenuItems into a single function
function renderRestaurantCards(category = 'All') {
    const restaurantMenuSection = document.querySelector('.restaurant-menu-section');
    restaurantMenuSection.innerHTML = ''; // Clear existing items

    fetchMenuItems().then(data => {
        const filteredItems = category === 'All' ? data : data.filter(item => item.category === category);

        // Retrieve shopping cart data from localStorage
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        filteredItems.forEach(item => {
            const restaurantCard = document.createElement('div');
            restaurantCard.className = 'restaurant-card';
            restaurantCard.setAttribute('data-item-id', item.id);
            restaurantCard.setAttribute('data-item-type', item.type);

            // Check if the item exists in the cart and get its quantity
            const cartItem = cart.find(cartItem => cartItem.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            // console.log(item.image_url);

            restaurantCard.innerHTML = `
                <div class="restaurant-card-image">
                    <img src="https://10.120.32.59/app${item.image_url}" alt="${item.name}" draggable="false">
                    ${quantity > 0 ? `<p class="item-quantity"><i class="fa-solid fa-cart-shopping"></i> ${quantity}</p>` : ''}
                </div>
                <div class="restaurant-card-header">
                    <h2>${item.name}</h2>
                </div>
                <div class="restaurant-card-description">
                    <p>${item.description}</p>
                </div>
                <div class="restaurant-card-price">
                    <h2>${item.price}€</h2>
                    ${isAdmin ? (item.visible === 'yes' 
                    ? '<i class="fa fa-eye" style="margin-left: 6px; color: gold;"></i>' 
                    : '<i class="fa fa-eye-slash" style="margin-left: 6px; color: gray;"></i>') 
                    : ''}
                </div>
            `;

            restaurantMenuSection.appendChild(restaurantCard);

            restaurantCard.addEventListener('click', (event) => {
                if (event.target.closest('.favorite-icon')) return;

                displayRestaurantModal(item.id, item.type);
            });
        });
        setupFavoriteIcons();
        fetchAndDisplayFavorites();
    });
}

// Update populateCategories to use the new renderRestaurantCards function
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
    allButton.addEventListener('click', () => renderRestaurantCards('All'));
    categoryMenu.appendChild(allButton);

    // Add buttons for each category
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'restaurant-category-item';
        button.textContent = formatCategoryText(category);
        button.addEventListener('click', () => renderRestaurantCards(category));
        categoryMenu.appendChild(button);
    });

    const restaurantItems = document.querySelectorAll(".restaurant-category-item");
    restaurantItems.forEach((item) => {
        item.addEventListener("click", () => {
            restaurantItems.forEach(div => div.classList.remove("menu-active"));
            item.classList.add("menu-active");
        });
    });
}

// Add a new function to fetch and render meals from the API
async function renderMeals() {
    const [meals, items] = await Promise.all([
        fetchData(`${apiUrl}/meals`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
            }
        }),
        fetchData(`${apiUrl}/items`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
            }
        })
    ]);

    const validItemIds = new Set(items.map(item => item.id));
    const restaurantMenuCards = document.querySelector(".restaurant-meals-cards");
    restaurantMenuCards.innerHTML = ""; // clear previous meals

    const mealsSection = document.createElement("div");
    mealsSection.className = "restaurant-meals-item";

    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    for (const meal of meals) {
        const itemIds = Object.values(meal.item_ids).filter(id => id); // Extract all item IDs
        const associatedItems = [];

        for (const itemId of itemIds) {
            try {
                const itemData = await fetchMenuItemsById(itemId);
                associatedItems.push(itemData);
            } catch (error) {
                console.error(`Error fetching item with ID ${itemId}:`, error);
            }
        }

        const cartItem = cart.find(cartItem => cartItem.id === meal.id && cartItem.type === 'meal');
        const quantity = cartItem ? cartItem.quantity : 0;

        const mealCard = document.createElement("div");
        mealCard.className = "restaurant-card";
        mealCard.setAttribute('data-item-id', meal.id);
        mealCard.setAttribute('data-item-type', 'meal');
        mealCard.innerHTML = `
            <div class="restaurant-card-image">
                <img src="https://10.120.32.59/app${meal.image_url}" alt="${meal.name}" draggable="false">
                ${quantity > 0 ? `<p class="item-quantity"><i class="fa-solid fa-cart-shopping"></i> ${quantity}</p>` : ""}
            </div>
            <div class="restaurant-card-header">
                <h2>${meal.name}</h2>
            </div>
            <div class="restaurant-card-description">
                <p>${meal.description}</p>
            </div>
            <div class="restaurant-card-price">
                <h2>${meal.price}€</h2>
                ${isAdmin ? (meal.visible === 'yes' 
                ? '<i class="fa fa-eye" style="margin-left: 6px; color: gold;"></i>' 
                : '<i class="fa fa-eye-slash" style="margin-left: 6px; color: gray;"></i>') 
                : ''}
            </div>
        `;

        mealCard.addEventListener("click", () => {
            displayRestaurantModal(meal.id, "meal");
        });

        mealsSection.appendChild(mealCard);
    }

    if (mealsSection.children.length === 0) {
        const noMealsMessage = document.createElement("p");
        noMealsMessage.textContent = "Meals are currently not available.";
        noMealsMessage.className = "no-meals-message"; // add style if desired
        restaurantMenuCards.appendChild(noMealsMessage);
    } else {
        restaurantMenuCards.appendChild(mealsSection);
    }
    setupFavoriteIcons();
    fetchAndDisplayFavorites();
}

// Call populateCategories and renderMeals on page load
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    renderRestaurantCards('All'); // Ensure all cards are displayed on page load
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
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Store the JWT token for future requests
            localStorage.setItem('authToken', data.token);
            const token = localStorage.getItem('authToken');
            const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token (base64)
            const role = decodedToken.role;

            if (role === 'admin') {
                isAdmin = true;
                location.reload();
            } else {
                isAdmin = false
            }
            loggedIn();
            fetchAndDisplayFavorites();
            closeForms();
            showToast("Login Successfull", "success")
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
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
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
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
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
    const data = await fetchData(`${apiUrl}/items`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
        }
    });
    return data;
}

const fetchMenuItemsById = async (id) => {
    const data = await fetchData(`${apiUrl}/items/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
        }
    });
    return data;
}

const fetchMenuMealsById = async (id) => {
    const data = await fetchData(`${apiUrl}/meals/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
        }
    });
    return data;
}

const getUserByToken = async (token) => {
    const data = await fetchData(`${apiUrl}/users/token`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
        }
    });
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
        const res = await fetch(`${apiUrl}/items/${itemId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
            }
        });
        const item = await res.json();
  
        if (res.ok) {
          console.log(item);
          displayRestaurantModal(item.id, item.type);
        } else {
          console.warn('Failed to fetch item by ID from URL.');
        }
      } else if (mealId) {
        // Fetch meal details from meals API
        const res = await fetch(`${apiUrl}/meals/${mealId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const meal = await res.json();
  
        if (res.ok) {
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
  
const displayRestaurantModal = async (id, type) => {
    let data;

    if (type === 'item') {
        data = await fetchMenuItemsById(id);
    } else if (type === 'meal') {
        data = await fetchMenuMealsById(id);
    } else {
        throw new Error(`Unsupported type: ${type}`);
    }

    console.log(data);

    updateItemIdInURL(data.id, data.type);

    const information = document.getElementById("information");
    information.classList.toggle("open-information-section");
    information.innerHTML = "";

    if (information.classList.contains("open-information-section")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }

    if (type === 'meal') {
        let amount = 1;

        // Fetch associated items for the meal
        const associatedItems = [];
        const itemIds = Object.values(data.item_ids).filter(id => id); // Extract all item IDs

        console.log(itemIds);

        for (const itemId of itemIds) {
            try {
                const itemData = await fetchMenuItemsById(itemId);
                associatedItems.push(itemData);
            } catch (error) {
                console.error(`Error fetching item with ID ${itemId}:`, error);
            }
        }

        const mealDetailsHTML = `
            <div class="information-container">
                        ${isAdmin ? (data.visible === 'yes' 
            ? '<i class="fa fa-eye" style="margin-left: 6px; color: gold;"></i>' 
            : '<i class="fa fa-eye-slash" style="margin-left: 6px; color: gray;"></i>') 
            : ''}
                <div class="information-image">
                    <img src="https://10.120.32.59/app${data.image_url}" alt="${data.name}" draggable="false">
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
                    <div class="information-content-meal-items">
                        <h3>Meal Includes:</h3>
                        <ul>
                            ${associatedItems.map(item => `<li class="meal-items"><strong>${item.name} (${formatCategoryText(item.category)}):</strong> ${item.description}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="information-footer">
                    <div class="information-footer-amount">
                        <button id="meal-amount-btn-decrease" ${amount === 1 ? "disabled" : ""}>
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <p id="meal-amount-display">${amount}</p>
                        <button id="meal-amount-btn-increase">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <button class="information-footer-add" ${data.stock === "no" ? "disabled" : ""}>
                        <p>Add to Cart</p>
                        <p id="meal-total-price">${(data.price * amount).toFixed(2)}€</p>
                    </button>
                </div>
            </div>
        `;

        information.innerHTML = mealDetailsHTML;

        const decreaseButton = document.getElementById("meal-amount-btn-decrease");
        const increaseButton = document.getElementById("meal-amount-btn-increase");
        const amountDisplay = document.getElementById("meal-amount-display");
        const totalPriceDisplay = document.getElementById("meal-total-price");

        increaseButton.addEventListener("click", () => {
            amount++;
            amountDisplay.textContent = amount;
        
            amountDisplay.classList.add("scale-animation");
            amountDisplay.addEventListener("animationend", () => {
                amountDisplay.classList.remove("scale-animation");
            }, { once: true });
        
            totalPriceDisplay.textContent = `${(data.price * amount).toFixed(2)}€`;
        
            totalPriceDisplay.classList.add("scale-animation");
            totalPriceDisplay.addEventListener("animationend", () => {
                totalPriceDisplay.classList.remove("scale-animation");
            }, { once: true });
        
            if (amount > 1) {
                decreaseButton.disabled = false;
                decreaseButton.style.cursor = "pointer";
            }
        });

        decreaseButton.addEventListener("click", () => {
            if (amount > 1) {
                amount--;
                amountDisplay.textContent = amount;
        
                amountDisplay.classList.add("scale-animation");
                amountDisplay.addEventListener("animationend", () => {
                    amountDisplay.classList.remove("scale-animation");
                }, { once: true });
        
                totalPriceDisplay.textContent = `${(data.price * amount).toFixed(2)}€`;
        
                totalPriceDisplay.classList.add("scale-animation");
                totalPriceDisplay.addEventListener("animationend", () => {
                    totalPriceDisplay.classList.remove("scale-animation");
                }, { once: true });
            }
        
            if (amount === 1) {
                decreaseButton.disabled = true;
                decreaseButton.style.cursor = "not-allowed";
            }
        });

        const addToCartButton = document.querySelector(".information-footer-add");
        addToCartButton.addEventListener("click", () => {
            addToCart(data, amount, 'meal');
        });
    } else {
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        let amount = 1;

        const allergens = data.allergens ? data.allergens.split(',') : null;
        const allergensHTML = allergens ? allergens.map(allergen => `<span style="background-color: #FFC94B; color: black; margin-right: 5px; padding: 2px 5px; border-radius: 3px;">${allergen.trim()}</span>`).join('') : 'None';

        const sizeHTML = data.size ? `<div class="information-content-size">
            <p>Size -<span style="background-color: #FFC94B; color: black; margin-right: 5px; padding: 2px 5px; border-radius: 3px;">${capitalize(data.size)}</span></p>
        </div>` : '';

        const informationContainer = document.createElement("div");
        informationContainer.className = "information-container";
        informationContainer.innerHTML = `
            ${isAdmin ? (data.visible === 'yes' 
            ? '<i class="fa fa-eye" style="margin-left: 6px; color: gold;"></i>' 
            : '<i class="fa fa-eye-slash" style="margin-left: 6px; color: gray;"></i>') 
            : ''}
            <div class="information-image">
                <img src="https://10.120.32.59/app${data.image_url}" alt="${data.name}" draggable="false">
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
                    <h3>Ingredients:</h3>
                    <p><span>${data.ingredients}</span></p>
                </div>
                <div class="information-content-allergens">
                    <h3>Allergens: </h3>
                    <p style="margin-top: 10px">${allergensHTML}</p>
                </div>
                ${sizeHTML}
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
        `;

        information.appendChild(informationContainer);

        const decreaseButton = informationContainer.querySelector("#information-amount-btn-decrease");
        const increaseButton = informationContainer.querySelector("#information-amount-btn-increase");
        const amountDisplay = informationContainer.querySelector("#information-amount-display");
        const totalPriceDisplay = informationContainer.querySelector("#information-total-price");

        increaseButton.addEventListener("click", () => {
            amount++;
            amountDisplay.textContent = amount;
        
            // Add the scaling animation to amountDisplay
            amountDisplay.classList.add("scale-animation");
            amountDisplay.addEventListener("animationend", () => {
                amountDisplay.classList.remove("scale-animation");
            }, { once: true });
        
            // Update the total price
            totalPriceDisplay.textContent = `${(data.price * amount).toFixed(2)}€`;
        
            // Add the scaling animation to totalPriceDisplay
            totalPriceDisplay.classList.add("scale-animation");
            totalPriceDisplay.addEventListener("animationend", () => {
                totalPriceDisplay.classList.remove("scale-animation");
            }, { once: true });
        
            if (amount > 1) {
                decreaseButton.disabled = false;
                decreaseButton.style.cursor = "pointer";
            }
        });
        
        decreaseButton.addEventListener("click", () => {
            if (amount > 1) {
                amount--;
                amountDisplay.textContent = amount;
        
                // Add the scaling animation to amountDisplay
                amountDisplay.classList.add("scale-animation");
                amountDisplay.addEventListener("animationend", () => {
                    amountDisplay.classList.remove("scale-animation");
                }, { once: true });
        
                // Update the total price
                totalPriceDisplay.textContent = `${(data.price * amount).toFixed(2)}€`;
        
                // Add the scaling animation to totalPriceDisplay
                totalPriceDisplay.classList.add("scale-animation");
                totalPriceDisplay.addEventListener("animationend", () => {
                    totalPriceDisplay.classList.remove("scale-animation");
                }, { once: true });
            }
        
            if (amount === 1) {
                decreaseButton.disabled = true;
                decreaseButton.style.cursor = "not-allowed";
            }
        });

        const buttonAddToCart = document.querySelector(".information-footer-add");
        buttonAddToCart.addEventListener("click", () => {
            addToCart(data, amount, 'item');
        });

    }
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
                        quantityDisplay.innerHTML = `<i class="fa-solid fa-cart-shopping"> ${quantity}`;
                        card.querySelector(".restaurant-card-image").appendChild(quantityDisplay);
                    } else {
                        quantityDisplay.innerHTML = `<i class="fa-solid fa-cart-shopping"> ${quantity}`;
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

        // Add the scaling animation to amountDisplay
        amountDisplay.classList.add("scale-animation");
        amountDisplay.addEventListener("animationend", () => {
            amountDisplay.classList.remove("scale-animation");
        }, { once: true });

        priceDisplay.textContent = `${(amount * item.price).toFixed(2)}€`;
        updateCartTotal();

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

        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const updatedCart = cart.filter(cartItem => cartItem.id !== item.id);
        localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));

        showToast(`${item.name} removed from cart!`, 'success');
        updateRestaurantCardQuantity(item.id, 0, item.type);
    });
}

function toggleProceedButton() {
    const shoppingCartList = document.querySelector(".shopping-cart-list");
    const proceedButton = document.getElementById("shopping-cart-order");

    // Count only elements with the class "shopping-cart-item"
    const cartItems = shoppingCartList.querySelectorAll(".shopping-cart-item");

    if (cartItems.length === 0) {
        proceedButton.disabled = true;
    } else {
        proceedButton.disabled = false;
    }
}

function updateCartTotal() {
    const shoppingCartList = document.querySelector(".shopping-cart-list");
    const cartItems = shoppingCartList.querySelectorAll(".shopping-cart-item");
    let totalPrice = 0;

    // Clear any existing empty cart message
    const emptyCartMessage = document.querySelector(".empty-cart-message");
    if (emptyCartMessage) {
        emptyCartMessage.remove();
    }

    // Check if the cart is empty
    if (cartItems.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-cart-message";
        message.textContent = "Your shopping cart is empty.";
        shoppingCartList.appendChild(message);
    } else {
        cartItems.forEach((item) => {
            const itemTotalPrice = parseFloat(item.querySelector("#shopping-cart-price").textContent.replace("€", ""));
            totalPrice += itemTotalPrice;
        });
    }

    const shoppingCartOrderTotal = document.querySelector("#shopping-cart-total");
    if (shoppingCartOrderTotal) {
        shoppingCartOrderTotal.textContent = `${totalPrice.toFixed(2)}€`;
    }

    const navbarCartPrice = document.getElementById("navbar-cart-price");
    if (navbarCartPrice) {
        navbarCartPrice.textContent = `${totalPrice.toFixed(2)}€`;
    }
    toggleProceedButton();
}

const informationOverlay = document.getElementById("information-overlay");
informationOverlay.addEventListener("click",  removeInformationClasses);

document.addEventListener("DOMContentLoaded", () => {
    loggedIn().then(() => {
        // Any actions that depend on loggedIn() being completed
        console.log("User logged in");
    });

    handleItemIdFromURL();

    const shoppingCartList = document.querySelector(".shopping-cart-list");
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    shoppingCartList.innerHTML = ""; // Clear existing items

    let totalPrice = 0;

    const renderCartItems = async () => {
        for (const cartItem of cart) {
            try {
                const endpoint = cartItem.type === "meal" ? `${apiUrl}/meals/${cartItem.id}` : `${apiUrl}/items/${cartItem.id}`;
                const response = await fetch(endpoint, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
                    }
                });
                const item = await response.json();

                if (response.ok) {
                    const shoppingCartItem = document.createElement("div");
                    shoppingCartItem.className = "shopping-cart-item";
                    shoppingCartItem.setAttribute("data-item-id", item.id);
                    shoppingCartItem.innerHTML = `
                        <div class="shopping-cart-header">
                            <div class="shopping-cart-img">
                                <img src="https://10.120.32.59/app${item.image_url}" alt="${item.name}">
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
                } else {
                    console.warn(`Failed to fetch item with ID ${cartItem.id}`);
                }
            } catch (error) {
                console.error(`Error fetching item with ID ${cartItem.id}:`, error);
            }
        }

        // Call updateCartTotal after all items are rendered
        updateCartTotal();
    };

    renderCartItems();

    // Update item-quantity display for restaurant cards on page load
    const restaurantCards = document.querySelectorAll(".restaurant-card");

    restaurantCards.forEach(card => {
        const cardName = card.querySelector(".restaurant-card-header h2").textContent;
        const cartItem = cart.find(item => item.name === cardName);

        if (cartItem && cartItem.quantity > 0) {
            let quantityDisplay = card.querySelector(".item-quantity");

            if (!quantityDisplay) {
                quantityDisplay = document.createElement("p");
                quantityDisplay.className = "item-quantity";
                card.querySelector(".restaurant-card-image").appendChild(quantityDisplay);
            }

            quantityDisplay.innerHTML = `<i class="fa-solid fa-cart-shopping"> ${cartItem.quantity}`;
        }
    });
});

function addToCart(data, amount, type) {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const existingItem = cart.find(item => item.id === data.id && item.type === type);

    if (existingItem) {
        existingItem.quantity += amount;
    } else {
        cart.push({ id: data.id, quantity: amount, type });
    }

    localStorage.setItem("shoppingCart", JSON.stringify(cart));

    // Update the cart dynamically
    const shoppingCartList = document.querySelector(".shopping-cart-list");
    let cartItemElement = shoppingCartList.querySelector(`[data-item-id="${data.id}"]`);

    if (cartItemElement) {
        const quantityDisplay = cartItemElement.querySelector("#shopping-cart-amount");
        const priceDisplay = cartItemElement.querySelector("#shopping-cart-price");

        const newQuantity = parseInt(quantityDisplay.textContent, 10) + amount;
        quantityDisplay.textContent = newQuantity;
        priceDisplay.textContent = `${(newQuantity * data.price).toFixed(2)}€`;
        showToast(`${data.name} quantity updated in cart!`, 'success');
    } else {
        const shoppingCartItem = document.createElement("div");
        shoppingCartItem.className = "shopping-cart-item";
        shoppingCartItem.setAttribute("data-item-id", data.id);
        shoppingCartItem.innerHTML = `
            <div class="shopping-cart-header">
                <div class="shopping-cart-img">
                    <img src="https://10.120.32.59/app${data.image_url}" alt="${data.name}">
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
        showToast(`${data.name} added to cart!`, 'success');
    }

    updateCartTotal();

    // Update the item-quantity display on the restaurant card
    const restaurantCards = document.querySelectorAll(".restaurant-card");
    restaurantCards.forEach(card => {
        const cardName = card.querySelector(".restaurant-card-header h2").textContent;
        if (cardName === data.name) {
            let quantityDisplay = card.querySelector(".item-quantity");

            if (!quantityDisplay) {
                quantityDisplay = document.createElement("p");
                quantityDisplay.className = "item-quantity";
                card.querySelector(".restaurant-card-image").appendChild(quantityDisplay);
            }

            const cartItem = cart.find(item => item.id === data.id && item.type === type);
            quantityDisplay.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${cartItem.quantity}`;
        }
    });

    removeInformationClasses();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.classList.add('toast', type);
  
    const toastContent = document.createElement('div');
    toastContent.classList.add('toast-content');
  
    const icon = document.createElement('div');
    icon.classList.add('check');
    icon.innerHTML = type === 'success' ? '✔' : '✖';
  
    const msg = document.createElement('div');
    msg.classList.add('message');
    msg.innerHTML = `<div class="text text-1">${message}</div>`;
  
    const closeButton = document.createElement('i');
    closeButton.classList.add('fa-solid', 'fa-xmark', 'close');
    closeButton.addEventListener('click', () => {
      hideToast(toast);
      clearTimeout(autoDismissTimeout);
    });
  
    toastContent.appendChild(icon);
    toastContent.appendChild(msg);
  
    toast.appendChild(toastContent);
    toast.appendChild(closeButton);
  
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
  
    const allToasts = container.querySelectorAll('.toast');
    allToasts.forEach(existingToast => {
      if (existingToast !== toast) {
        existingToast.classList.add('slide-down');
      }
    });
  
    setTimeout(() => {
      toast.classList.add('active');
    }, 100);
  
    // Manage timeout and hover logic
    let autoDismissTimeout = setTimeout(() => {
      hideToast(toast);
    }, 4000);
  
    toast.addEventListener('mouseenter', () => {
      clearTimeout(autoDismissTimeout);
    });
  
    toast.addEventListener('mouseleave', () => {
      autoDismissTimeout = setTimeout(() => {
        hideToast(toast);
      }, 2000); 
    });
  }
  
  function hideToast(toast) {
    toast.classList.add('slide-out');
    setTimeout(() => {
      toast.remove();
    }, 500);
  }

// Add favorite icon to each card and handle favorite functionality
const setupFavoriteIcons = async () => {
    const restaurantCards = document.querySelectorAll('.restaurant-card');

    restaurantCards.forEach(card => {
        // Check if the card already has a favorite icon
        if (card.querySelector('.favorite-icon')) {
            return; // Skip if the icon already exists
        }

        const favoriteIcon = document.createElement('i');
        favoriteIcon.className = 'fa fa-heart favorite-icon';
        favoriteIcon.id = "heart-icon";
        favoriteIcon.style.color = 'gray';

        card.appendChild(favoriteIcon);

        favoriteIcon.addEventListener('click', async () => {
            // Prevent the click event from propagating to the restaurant card

            if (!isAdmin && !localStorage.getItem('authToken')) {
                showToast('Please log in to use the favorite feature.', 'error');
                return;
            }

            const type = card.getAttribute('data-item-type');
            const itemId = card.getAttribute('data-item-id');

            console.log(favoriteIcon);

            if (favoriteIcon.style.color === 'red') {
                // Remove from favorites
                try {
                    const response = await fetch(`${apiUrl}/favourites/`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ itemId, type })
                    });

                    console.log(JSON.stringify({ itemId, type }))
                    if (response.ok) {
                        favoriteIcon.style.color = 'gray';
                        showToast('Removed from favorites.', 'success');
                    } else {
                        const data = await response.json();
                        console.log(itemId, type);
                        showToast(data.message || 'Failed to remove from favorites.', 'error');
                    }
                } catch (error) {
                    console.error('Error removing from favorites:', error);
                    showToast('An error occurred.', 'error');
                }
            } else {
                // Add to favorites
                try {
                    const response = await fetch(`${apiUrl}/favourites/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ itemId, type })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        favoriteIcon.style.color = 'red';
                        favoriteIcon.setAttribute('data-favorite-id', result.id);
                        showToast('Added to favorites.', 'success');
                    } else {
                        const data = await response.json();
                        showToast(data.message || 'Failed to add to favorites.', 'error');
                    }
                } catch (error) {
                    console.error('Error adding to favorites:', error);
                    showToast('An error occurred.', 'error');
                }
            }
        });
    });
};

// Fetch and display user favorites on page load
async function fetchAndDisplayFavorites() {
    const token = localStorage.getItem("authToken");

    if (!token) {
        console.warn("No auth token found.");
        return;
    }

    try {
        const response = await fetch(`${apiUrl}/favourites`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const favorites = await response.json();
            console.log("Fetched Favorites:", favorites);

            // Get all restaurant cards and meal cards
            const restaurantCards = document.querySelectorAll(".restaurant-card");
            const restaurantMealCards = document.querySelectorAll(".restaurant-meals-cards .restaurant-card");

            // Combine both types of cards
            const allCards = [...restaurantCards, ...restaurantMealCards];

            // Iterate over the favorites and match them with the cards
            favorites.forEach((favorite) => {
                allCards.forEach((card) => {
                    const itemId = card.getAttribute("data-item-id");
                    const type = card.getAttribute("data-item-type"); // Can be 'item' or 'meal'
                    const favoriteIcon = card.querySelector(".favorite-icon");

                    // Match the favorite with the card
                    if (itemId === String(favorite.item_id) && type === favorite.type) {
                        favoriteIcon.style.color = "red"; // Mark as favorite
                        favoriteIcon.setAttribute("data-favorite-id", favorite.id); // Store the favorite ID
                    }
                });
            });
        } else {
            console.warn("Failed to fetch favorites. Status:", response.status);
        }
    } catch (error) {
        console.error("Error fetching favorites:", error);
    }
}
// fetchAndDisplayFavorites();

const searchBtn = document.getElementById("navbar-search-icon");
searchBtn.addEventListener("click", () => {
    const searchResultsContainer = document.getElementById("search-results");
    searchResultsContainer.classList.add("active");

    const searchOverlay = document.querySelector(".search-overlay");
    searchOverlay.classList.toggle("active");

    if (searchOverlay.classList.contains("active")) {
        document.body.style.overflowY = "hidden";
    } else {
        document.body.style.overflowY = ""; // Reset to default
    }
});

// Update the search results container with fetched data
function updateSearchResults(data) {
    const searchResultsContainer = document.getElementById("search-results");
    const announcementsSection = document.getElementById("search-announcements");
    const itemsSection = document.getElementById("search-items");
    const mealsSection = document.getElementById("search-meals");

    // Clear previous results
    announcementsSection.innerHTML = "<h3>Announcements</h3>";
    itemsSection.innerHTML = "<h3>Items</h3>";
    mealsSection.innerHTML = "<h3>Meals</h3>";

    // Populate announcements
    if (data.announcements && data.announcements.length > 0) {
        data.announcements.forEach(announcement => {
            const link = document.createElement("a");
            link.href = `/annoucement/index.html?id=${announcement.id}`;
        
            const announcementItem = document.createElement("div");
            announcementItem.className = "search-results-item";
            announcementItem.textContent = announcement.title || "Announcement";
        
            link.appendChild(announcementItem);
            announcementsSection.appendChild(link);
        });
        
    } else {
        const noAnnouncements = document.createElement("div");
        noAnnouncements.className = "search-results-empty";
        noAnnouncements.textContent = "No announcements found.";
        announcementsSection.appendChild(noAnnouncements);
    }

    // Populate items
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            const link = document.createElement("a");
            link.href = `index.html?itemId=${item.id}#menu`;
            
            const itemElement = document.createElement("div");
            itemElement.className = "search-results-item";
            itemElement.textContent = `${item.name} - ${item.price}€`;
            
            link.appendChild(itemElement);
            itemsSection.appendChild(link);            
        });
    } else {
        const noItems = document.createElement("div");
        noItems.className = "search-results-empty";
        noItems.textContent = "No items found.";
        itemsSection.appendChild(noItems);
    }

    // Populate meals
    if (data.meals && data.meals.length > 0) {
        data.meals.forEach(meal => {
            const link = document.createElement("a");
            link.href = `index.html?mealId=${meal.id}#menu`;

            const mealElement = document.createElement("div");
            mealElement.className = "search-results-item";
            mealElement.textContent = `${meal.name} - ${meal.price}€`;
            
            link.appendChild(mealElement);
            mealsSection.appendChild(link);            
        });
    } else {
        const noMeals = document.createElement("div");
        noMeals.className = "search-results-empty";
        noMeals.textContent = "No meals found.";
        mealsSection.appendChild(noMeals);
    }

    // Show the search results container
    searchResultsContainer.classList.add("active");
}

// Modify the event listener for the search input
const searchItemInput = document.getElementById("search-item");
searchItemInput.addEventListener("input", async (event) => {
    const query = event.target.value;

    console.log(query);

    try {
        const response = await fetch(`${apiUrl}/search/?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (response.ok) {
            const searchResults = await response.json();
            const searchResultsBox = document.querySelector(".search-results-box");

            if (query === "") {
                searchResultsBox.style.display = "none";
            } else {
                searchResultsBox.style.display = "block";
                updateSearchResults(searchResults);
            }
        } else {
            console.error("Failed to fetch search results.");
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
});

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

                        // Populate the modal with the summaries
                        const modal = document.getElementById("route-modal");
                        const summariesContainer = document.getElementById("route-summaries");
                        summariesContainer.innerHTML = summaries.map(summary => `<p>${summary}</p>`).join("");

                        // Show the modal
                        modal.style.display = "block";

                        // Close the modal when the close button is clicked
                        const closeButton = document.querySelector(".close-button");
                        closeButton.onclick = () => {
                            modal.style.display = "none";
                        };

                        // Close the modal when clicking outside the modal content
                        window.onclick = (event) => {
                            if (event.target === modal) {
                                modal.style.display = "none";
                            }
                        };
                    } catch (error) {
                        console.error("Error displaying route summaries:", error);
                    }
                });
            });

            //
            const marker = L.marker([60.22378791379731, 25.0792582351028]).addTo(map);

            marker.bindTooltip("Burger Company", {
                permanent: false, // Tooltip only shows on hover
                direction: 'top'
            });
        });
    } catch (error) {
        console.error('Error drawing stops on map:', error);
    }
}

initMap();
// console.log(map)
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