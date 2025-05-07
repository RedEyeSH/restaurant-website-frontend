const apiUrl = "https://10.120.32.59/app/api/v1";
let isAdmin;

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
            location.reload();
        } else {
            alert(data.message || 'An error occurred during login.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing your login.');
    }
});

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

function removeSearchClasses() {
    const searchResultsContainer = document.getElementById("search-results");
    searchResultsContainer.classList.remove("active");

    const searchOverlay = document.querySelector(".search-overlay");
    searchOverlay.classList.remove("active");

    document.body.style.overflow = "";
}

const searchBtn = document.getElementById("navbar-search-icon");
/**
 * Toggles the visibility of the search results container and overlay.
 * Handles the click event for the search button in the navbar.
 * Disables page scrolling when the search overlay is active.
 */
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

/**
 * Updates the search results container with fetched data.
 * Populates announcements, items, and meals sections with the provided data.
 *
 * @param {Object} data - The data containing search results.
 * @param {Array} [data.announcements] - An array of announcement objects.
 * @param {Array} [data.items] - An array of item objects.
 * @param {Array} [data.meals] - An array of meal objects.
 */
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
            link.href = `../index.html?itemId=${item.id}#menu`;
            
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
            link.href = `../index.html?mealId=${meal.id}#menu`;

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
/**
 * Handles the input event for the search bar.
 * Sends the user's query to the backend to fetch search results and updates the search results container.
 *
 * @async
 * @param {Event} event - The input event triggered by the user typing in the search bar.
 * @returns {Promise<void>} A promise that resolves when the search results are fetched and displayed.
 */
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


const closeSearchOverlay = document.querySelector(".search-overlay");
closeSearchOverlay.addEventListener("click", removeSearchClasses)

const close_form = document.querySelectorAll(".x-close-form");
close_form.forEach((button) => {
    button.addEventListener("click", closeForms);
});

const close_form_overlay = document.getElementById("box-overlay");
close_form_overlay.addEventListener("click", closeForms)

function closeForms() {
    document.getElementById("box-overlay").classList.remove("show-box-overlay");
    document.getElementById("account-container").classList.remove("account-container-form");
    document.getElementById("account").classList.remove("open-account-section");
}

let userId = null; // Declare userId variable outside of functions

document.addEventListener("DOMContentLoaded", async () => {
    await loggedIn(); // Ensure loggedIn completes before proceeding
    displayShoppingCart();
    setupOrderForm();
    toggleAddressInputs();
});

const showOrderSuccessModal = (orderId) => {
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "#191919";
    modalContent.style.color = "white";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "10px";
    modalContent.style.textAlign = "center";
    modalContent.style.maxWidth = "500px";
    modalContent.style.width = "100%";

    modalContent.innerHTML = `
        <h2>Order Completed Successfully!</h2>
        <p>Your order ID is: <strong>${orderId}</strong></p>
        <p style="margin-top:20px">A confirmation email with your order details has been sent to your email. 📩</p>
        <button id="close-modal" style="margin-top: 20px; padding: 10px 20px; background-color: #F7B41A; color: #0D0D0D; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const closeModalButton = document.getElementById("close-modal");
    closeModalButton.addEventListener("click", () => {
        modal.remove();
        window.location.reload();
    });
};

const getScheduledTime = () => {
    const scheduledTimeSelect = document.getElementById("scheduled-time");
    const customTimeInput = document.getElementById("custom-time");

    if (scheduledTimeSelect.value === "now") {
        return "now";
    } else if (scheduledTimeSelect.value === "custom") {
        return customTimeInput.value;
    }
    return "now"; // Default fallback
};

const clearErrorOnInput = (inputElement) => {
    inputElement.addEventListener("input", () => {
        const errorBox = document.getElementById("error-box");
        errorBox.style.display = "none";
        inputElement.style.border = "";
    });
};

const validateForm = () => {
    const errors = [];
    const customerNameInput = document.getElementById("customer-name");
    const customerPhoneInput = document.getElementById("customer-phone");
    const customerEmailInput = document.getElementById("customer-email");
    const methodInput = document.getElementById("method");
    const streetInput = document.getElementById("street");
    const postalCodeInput = document.getElementById("postal-code");
    const cityInput = document.getElementById("city");
    const scheduledTimeInput = document.getElementById("scheduled-time");
    const customTimeInput = document.getElementById("custom-time");

    // Attach clearErrorOnInput to each input
    [
        customerNameInput,
        customerPhoneInput,
        customerEmailInput,
        methodInput,
        streetInput,
        postalCodeInput,
        cityInput,
        scheduledTimeInput,
        customTimeInput
    ].forEach(input => clearErrorOnInput(input));

    // Reset input borders
    [
        customerNameInput,
        customerPhoneInput,
        customerEmailInput,
        methodInput,
        streetInput,
        postalCodeInput,
        cityInput,
        scheduledTimeInput,
        customTimeInput
    ].forEach(input => input.style.border = "");

    if (!customerNameInput.value.trim()) {
        errors.push("Name is required.");
        customerNameInput.style.border = "2px solid red";
    }

    if (!customerPhoneInput.value.trim() || !/^(?:\+358|0)\d{8,9}$/.test(customerPhoneInput.value.trim())) {
        errors.push("Invalid phone number format. Expected Finnish format: +358XXXXXXXXX or 0XXXXXXXXX.");
        customerPhoneInput.style.border = "2px solid red";
    }

    if (!customerEmailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmailInput.value.trim())) {
        errors.push("A valid email is required.");
        customerEmailInput.style.border = "2px solid red";
    }

    if (methodInput.value === "delivery") {
        if (!streetInput.value.trim()) {
            errors.push("Street is required for delivery.");
            streetInput.style.border = "2px solid red";
        }
        if (!postalCodeInput.value.trim() || !/^\d{5}$/.test(postalCodeInput.value.trim())) {
            errors.push("A valid Finnish postal code is required (5 digits).");
            postalCodeInput.style.border = "2px solid red";
        }
        const validCities = ["Helsinki", "Vantaa", "Espoo"];
        if (!cityInput.value.trim() || !validCities.includes(cityInput.value.trim())) {
            errors.push("City must be one of the following: Helsinki, Vantaa, Espoo.");
            cityInput.style.border = "2px solid red";
        }
    }

    if (scheduledTimeInput.value === "custom" && !customTimeInput.value.trim()) {
        errors.push("Custom time is required if selected.");
        customTimeInput.style.border = "2px solid red";
    }

    return errors;
};

const setupOrderForm = () => {
    const orderForm = document.getElementById("order-form");
    const orderBtn = document.getElementById('order-button');
    const orderSpinner = document.querySelector('.spinner');
    const errorBox = document.createElement("div");
    errorBox.id = "error-box";
    errorBox.style.color = "red";
    errorBox.style.marginTop = "10px";
    orderForm.appendChild(errorBox);

    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const errors = validateForm();
        errorBox.innerHTML = "";

        if (errors.length > 0) {
            errorBox.innerHTML = errors.map(error => `<p>${error}</p>`).join("");
            errorBox.style.display = "block";
            return;
        }

        orderBtn.disabled = true;
        orderSpinner.style.display = 'inline-block';

        const formData = new FormData(orderForm);
        const customerName = formData.get("customer_name");
        const customerPhone = formData.get("customer_phone");
        const customerEmail = formData.get("customer_email");
        const street = formData.get("street");
        const postalCode = formData.get("postalCode");
        const city = formData.get("city");
        const method = formData.get("method");
        const notes = formData.get("notes");
        const scheduledTime = getScheduledTime();

        const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

        const updatedCart = await Promise.all(shoppingCart.map(async (item) => {
            let apiUrl;
            if (item.type === "item") {
                apiUrl = `https://10.120.32.59/app/api/v1/items/${item.id}`;
            } else if (item.type === "meal") {
                apiUrl = `https://10.120.32.59/app/api/v1/meals/${item.id}`;
            }

            if (apiUrl) {
                try {
                    const response = await fetch(apiUrl);
                    if (response.ok) {
                        const data = await response.json();
                        return { ...item, price: data.price };
                    } else {
                        console.warn(`Item with ID ${item.id} not found in API. Removing from cart.`);
                        return null; // Mark item as invalid
                    }
                } catch (error) {
                    console.error(`Error fetching item with ID ${item.id}:`, error);
                    return null; // Mark item as invalid
                }
            }
            return null; // Mark item as invalid if no API URL
        }));

        // Filter out invalid items
        const validCart = updatedCart.filter(item => item !== null);

        const totalPrice = validCart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

        const orderData = {
            user_id: userId,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            items: validCart, // Use only valid items
            method: method,
            address: {
                street: street,
                postalCode: postalCode,
                city: city
            },
            scheduled_time: scheduledTime,
            notes: notes,
            total_price: totalPrice
        };

        try {
            const response = await fetch("https://10.120.32.59/app/api/v1/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });
            console.log("Order Data Sent:", JSON.stringify(orderData, null, 2));

            if (response.ok) {
                const responseData = await response.json();
                const orderId = responseData.order_id;
                orderForm.reset(); // Reset the form after successful submission
                orderForm.style.display = "none"; // Hide the form after submission
                showOrderSuccessModal(orderId);
                localStorage.removeItem("shoppingCart");
                orderBtn.disabled = false;
                orderSpinner.style.display = 'none';
            } else {
                let errorData;
                try {
                    const text = await response.text();
                    errorData = text ? JSON.parse(text) : { message: "No error details provided" };
                } catch (parseError) {
                    errorData = { message: "Failed to parse error response" };
                    orderBtn.disabled = false;
                    orderSpinner.style.display = 'none';
                }
                console.error("Error placing order:", errorData);
                alert("Failed to place order. Please try again.");
                orderBtn.disabled = false;
                orderSpinner.style.display = 'none';
            }
        } catch (error) {
            console.error("Error sending order data:", error);
            alert("Failed to place order. Please try again.");
            orderBtn.disabled = false;
            orderSpinner.style.display = 'none';
        }
    });
};

const displayShoppingCart = async () => {
    const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    // Log all items to the console
    console.log("Items:", shoppingCart);

    const orderContainer = document.querySelector(".order-table");

    // Clear the existing table (if any)
    orderContainer.innerHTML = "";

    const table = document.createElement("table");
    table.className = "order-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tableBody = table.querySelector("tbody");
    let totalPrice = 0;

    for (const item of shoppingCart) {
        let apiUrl;
        if (item.type === "item") {
            apiUrl = `https://10.120.32.59/app/api/v1/items/${item.id}`;
        } else if (item.type === "meal") {
            apiUrl = `https://10.120.32.59/app/api/v1/meals/${item.id}`;
        }

        if (apiUrl) {
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();

                    const quantity = item.quantity || 1;
                    const itemTotalPrice = data.price * quantity;
                    totalPrice += itemTotalPrice;

                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>
                            <div class="tr-header">
                                <img src="https://10.120.32.59/app${data.image_url}" alt="${data.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                                <p>${data.name}</p>
                            </div>
                        </td>
                        <td>${data.price}€</td>
                        <td>
                            <button class="decrease-btn" data-id="${item.id}" ${item.stock === "no" ? "disabled" : ""}>
                            <i class="fa-solid fa-minus"></i>
                            </button>
                            <span class="quantity">${quantity}</span>
                            <button class="increase-btn"  data-id="${item.id}" ${item.stock === "no" ? "disabled" : ""}>
                            <i class="fa-solid fa-plus"></i>
                            </button>
                            <button class="delete-btn" data-id="${item.id}">
                            <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </td>
                        <td>${itemTotalPrice.toFixed(2)}€</td>
                    `;
                    tableBody.appendChild(row);

                    // Add event listener for the delete button
                    const deleteButton = row.querySelector(".delete-btn");
                    deleteButton.addEventListener("click", () => deleteItem(item.id));

                    // Add event listeners for the increase and decrease buttons
                    const increaseButton = row.querySelector(".increase-btn");
                    const decreaseButton = row.querySelector(".decrease-btn");

                    increaseButton.addEventListener("click", () => updateQuantity(item.id, 1));
                    decreaseButton.addEventListener("click", () => updateQuantity(item.id, -1));
                } else {
                    console.error(`Failed to fetch item with ID ${item.id}: ${response.status}`);
                }
            } catch (error) {
                console.error(`Error fetching item with ID ${item.id}:`, error);
            }
        }
    }

    const totalRow = document.createElement("tr");
    totalRow.className = "order-total-row";
    totalRow.innerHTML = `
        <td colspan="4" style="text-align: right; font-weight: bold;">Total Price: ${totalPrice.toFixed(2)}€</td>
    `;
    // <td style="font-weight: bold;">${totalPrice.toFixed(2)}€</td>
    tableBody.appendChild(totalRow);

    orderContainer.appendChild(table);
};


// Function to update the quantity of an item in the shopping cart
const updateQuantity = (itemId, change) => {
    let shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    // Find the item in the cart and update its quantity
    const item = shoppingCart.find(item => item.id === itemId);
    if (item) {
        // Ensure the quantity does not go below 1
        item.quantity = Math.max(1, item.quantity + change);

        // Update the shoppingCart in localStorage
        localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));

        // Re-render the shopping cart after updating the quantity
        displayShoppingCart();
    }
};


// Function to delete an item from the shopping cart and update localStorage
const deleteItem = (itemId) => {
    let shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    // Filter out the item to delete by matching the item id
    shoppingCart = shoppingCart.filter(item => item.id !== itemId);

    // Update the shoppingCart in localStorage
    localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));

    // Re-render the shopping cart after deletion
    displayShoppingCart();

    // Get the order form and container elements
    const orderForm = document.getElementById("order-form");
    const orderContainer = document.querySelector(".order-container");
    const orderTable = document.querySelector(".order-table");
    // If the shopping cart is empty, hide the order form and show an empty cart message
    if (shoppingCart.length === 0) {
        orderForm.style.display = "none";
        orderTab.style.display = "none";
        // Check if the empty cart message is already added, if not, create and add it
        const existingEmptyMessage = orderContainer.querySelector(".empty-cart-message");
        if (!existingEmptyMessage) {
            const emptyCartMessage = document.createElement("p");
            emptyCartMessage.textContent = "Your shopping cart is empty. Please add items to your cart before placing an order.";
            emptyCartMessage.className = "empty-cart-message"; // Add a class to easily find and remove later
            orderContainer.appendChild(emptyCartMessage);
        }
    }
};


const toggleAddressInputs = () => {
    const methodSelect = document.getElementById("method");
    const addressFields = [
        document.getElementById("street"),
        document.getElementById("postal-code"),
        document.getElementById("city")
    ];

    methodSelect.addEventListener("change", () => {
        if (methodSelect.value === "pickup") {
            addressFields.forEach(field => {
                field.parentElement.style.display = "none";
                field.required = false;
            });
        } else if (methodSelect.value === "delivery") {
            addressFields.forEach(field => {
                field.parentElement.style.display = "block";
                field.required = true;
            });
        }
    });

    // Trigger the change event on page load to set the initial state
    methodSelect.dispatchEvent(new Event("change"));
};

const loggedIn = async () => {
    const navbarActions = document.querySelector(".navbar-actions");
    const navbarLogin = document.getElementById("navbar-login");

    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const response = await fetch("https://10.120.32.59/app/api/v1/users/token", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                userId = userData.id; // Assign user ID to the variable
                document.getElementById("customer-name").value = userData.name;
                document.getElementById("customer-email").value = userData.email;

                const navbarLoggedIn = document.createElement("div");
                navbarLoggedIn.className = "navbar-logged-in";
                navbarLoggedIn.setAttribute("id", "navbar-logged-in");

                navbarLoggedIn.innerHTML = `
                    <a href="/profile/profile.html">${userData.name}</a>
                `;

                navbarLogin.remove();
                navbarActions.appendChild(navbarLoggedIn);
            } else {
                console.error("Failed to fetch user data", response.status);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }
};





