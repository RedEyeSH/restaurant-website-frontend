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
                        console.error(`Failed to fetch item with ID ${item.id}: ${response.status}`);
                        orderBtn.disabled = false;
                        orderSpinner.style.display = 'none';
                    }
                } catch (error) {
                    console.error(`Error fetching item with ID ${item.id}:`, error);
                    orderBtn.disabled = false;
                    orderSpinner.style.display = 'none';
                }
            }
            return item; // Return the original item if fetching fails
        }));

        const totalPrice = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

        const orderData = {
            user_id: userId,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            items: updatedCart,
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
                        <td>${quantity}</td>
                        <td>${itemTotalPrice.toFixed(2)}€</td>
                    `;
                    tableBody.appendChild(row);
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
        <td colspan="3" style="text-align: right; font-weight: bold;">Total Price:</td>
        <td style="font-weight: bold;">${totalPrice.toFixed(2)}€</td>
    `;
    tableBody.appendChild(totalRow);

    orderContainer.appendChild(table);
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





