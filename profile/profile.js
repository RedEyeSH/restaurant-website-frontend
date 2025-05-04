"use strict";

const sections = document.querySelectorAll(".container section");
const navigationLinks = document.querySelectorAll(".navigation-link");

// Save the current section in localStorage when a navigation link is clicked
navigationLinks.forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Remove 'link-active' from all links
        navigationLinks.forEach(nav => nav.classList.remove("link-active"));

        // Add 'link-active' to the clicked link
        event.currentTarget.classList.add("link-active");

        // Get the section ID from the link's ID (e.g., 'account-link' -> 'profile')
        const sectionId = event.currentTarget.id.replace("-link", "");

        // Save the current section ID in localStorage
        localStorage.setItem("currentSection", sectionId);

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
            section.style.display = section.id === sectionId ? "block" : "none";
        });
        closeNavigation();
    });
});

// On page load, check localStorage for the saved section ID
document.addEventListener("DOMContentLoaded", () => {
    const savedSection = localStorage.getItem("currentSection") || "profile"; // Default to "profile" if no section is saved

    // Show the saved section and hide others
    sections.forEach(section => {
        section.style.display = section.id === savedSection ? "block" : "none";
    });

    // Highlight the corresponding navigation link
    navigationLinks.forEach(link => {
        if (link.id === `${savedSection}-link`) {
            link.classList.add("link-active");
        } else {
            link.classList.remove("link-active");
        }
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

const menuToggle = document.querySelector("#menu-toggle");

menuToggle.addEventListener("click", () => {
    navigation.classList.toggle("open");
    navbarOverlay.classList.toggle("open");
});

navbarOverlay.addEventListener("click", () => {
    closeNavigation();
});

// Get the JWT token from localStorage
const token = localStorage.getItem('authToken');

// Redirect to login if no token is found
if (!token) {
  window.location.href = '../index.html';
}

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
        return null;
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
// const checkFormInputs = () => {
//     const inputs = profileForm.querySelectorAll("input");
//     let allFilled = true;

//     inputs.forEach(input => {
//         if (input.value.trim() === "") {
//             allFilled = false;
//         }
//     });

//     // Enable or disable the save button based on input values
//     saveButton.disabled = !allFilled;
// };

// Add event listeners to all input fields
// profileForm.querySelectorAll("input").forEach(input => {
    // input.addEventListener("input", checkFormInputs);
// });

// Initial check to disable the button if inputs are empty on page load
// checkFormInputs();

const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
    logoutUser();
});

const updateUserData = async () => {
    const profileForm = document.querySelector(".profile-form");
    const saveBtn = document.getElementById('save-btn');
    const spinner = saveBtn.querySelector('.spinner');
    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        saveBtn.disabled = true;
        spinner.style.display = "inline-block";
        const name = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("new-password").value.trim();
        const retypePassword = document.getElementById("retype-password").value.trim();

        if (!name || !email) {
            alert("Username and email are required.");
            saveBtn.disabled = false;
            spinner.style.display = "none";
            return;
        }

        if (password !== retypePassword) {
            alert("Passwords do not match.");
            saveBtn.disabled = false;
            spinner.style.display = "none";
            return;
        }

        const formData = {
            name,
            email,
            password,
            retypePassword,
        };

        console.log("Form Data:", formData);
        
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${apiUrl}/users/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to save data.");
            }

            const result = await response.json();
            alert("Profile updated successfully! You have to log in again.");
            logoutUser();
            saveBtn.disabled = false;
            spinner.style.display = "none";
            // window.location.href = "../index.html";
            console.log("Server Response:", result);
        } catch (error) {
            console.error("Error saving data:", error);
            alert("An error occurred while saving your profile.");
        }
    });
}

updateUserData();

// Fetch all favourite entries
const fetchFavourites = async () => {
    try {
        const response = await fetch(`${apiUrl}/favourites`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

        const data = await response.json();
        return data;
        // console.log(data);
    } catch (error) {
        console.error("Error fetching favourites:", error);
        return null;
    }
};

// Fetch item details by ID
const fetchFavouritesByItemId = async (id) => {
    try {
        const response = await fetch(`${apiUrl}/items/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch item ${id}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching item ${id}:`, error);
        return null;
    }
};

const displayFavourites = async () => {
    const favouriteList = document.querySelector(".favourite-list");
    favouriteList.innerHTML = "";

    const favouritesData = await fetchFavourites();
    if (!favouritesData || favouritesData.length === 0) {
        const noFavouritesMessage = document.createElement("p");
        noFavouritesMessage.textContent = "You have no favourite items yet.";
        noFavouritesMessage.className = "no-favourites-message";
        favouriteList.appendChild(noFavouritesMessage);
        return;
    }

    for (const data of favouritesData.favourites) {
        console.log(data);
        const item = await fetchFavouritesByItemId(data.item_id);
        if (!item) continue;

        const favouriteItem = document.createElement("div");
        favouriteItem.className = "favourite-item";
        favouriteItem.innerHTML = `
            <div class="favourite-item-box">
                <div class="favourite-header">
                    <div class="favourite-image">
                        <img src="../images/burgerfrommenu.png" alt="${item.name}">
                    </div>
                    <div class="favourite-info">
                        <p>${item.name}</p>
                    </div>
                </div>
                <div class="favourite-price">
                    <p>${item.price}€</p>
                </div>
            </div>
            <button class="favourite-delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;

        const deleteButton = favouriteItem.querySelector(".favourite-delete");
        deleteButton.addEventListener("click", async () => {
            const confirmed = confirm("Are you sure you want to remove this item from your favourites?");
            if (confirmed) {
                await deleteFavourite(data.id);
                console.log(data.id);
                favouriteItem.remove();
                if (favouriteList.children.length === 0) {
                    const noFavouritesMessage = document.createElement("p");
                    noFavouritesMessage.textContent = "You have no favourite items yet.";
                    noFavouritesMessage.className = "no-favourites-message";
                    favouriteList.appendChild(noFavouritesMessage);
                }
            }
        });

        favouriteList.appendChild(favouriteItem);
    }
}

displayFavourites();

const deleteFavourite = async (id) => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${apiUrl}/favourites/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete favourite with ID: ${id}`);
        }

        console.log(`Favourite with ID ${id} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting favourite with ID ${id}:`, error);
        alert("An error occurred while trying to delete the item.");
    }
}

// Fetches order history
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
            console.error(`Error: ${response.status} ${response.statusText}`);
            throw new Error("Failed to fetch user's ordered data.");
        }

        const data = await response.json();
        return data;

    } catch (error) {
        // console.error("Error fetching user's ordered data:", error);
        return null; // Return null to indicate failure
    }
};

const displayOrderHistory = async () => {
    const orderedData = await fetchOrderHistory();

    const orderHistory = document.querySelector(".order-history");
    orderHistory.innerHTML = "";

    if (!orderedData || orderedData.length === 0) {
        const noOrdersMessage = document.createElement("p");
        noOrdersMessage.textContent = "You have no orders yet.";
        noOrdersMessage.className = "no-orders-message";
        orderHistory.appendChild(noOrdersMessage);
        return;
    }

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

const orderHistoryPopup = async (item, data) => {
    orderPopupOverlay.classList.toggle("open");
    orderPopup.classList.toggle("open");

    orderPopup.innerHTML = "";

    console.log(data)

    const orderPopupItem = document.createElement("div");
    orderPopupItem.className = "order-popup-item";
    
    orderPopupItem.innerHTML = `
        <div class="order-popup-header">
            <h1>Order #${data.order_id}</h1>
            <i class="fa-solid fa-xmark" id="x-order"></i>
        </div>
        <hr>
        <div class="order-popup-description">
            <h2>Status: <span class="status">${data.status}</span></h2>
            <p><strong>Name:</strong> <span>${data.customer_name}</span></p>
            <p><strong>Email:</strong> <span>${data.customer_email}</span></p>
            <p><strong>Phone:</strong> <span>${data.customer_phone}</span></p>
            <p><strong>Method:</strong> <span>${data.method}</span></p>

            ${data.scheduled_time && data.scheduled_time !== "Now" 
                ? `<p><strong>Scheduled:</strong> <span>${new Date(data.scheduled_time).toLocaleString()}</span></p>` 
                : `<p><strong>Scheduled:</strong> <span>Now</span></p>`}
            ${data.address ? `<p><strong>Address:</strong> <span>${data.address.street}, ${data.address.postalCode}, ${data.address.city}</span></p>` : ""}
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
        </div>
        <div class="order-popup-card">
            <h3>Items</h3>
            <div class="order-popup-items">
                ${data.items.map(item => `
                    <div class="order-popup-box">
                        <div class="order-popup-box-header">
                            <div class="order-popup-box-image">
                                <img src="../images/burgerfrommenu.png" alt="${item.details.name}">
                                <p class="order-popup-box-quantity">${item.quantity}</p>
                            </div>
                            <div class="order-popup-box-name">
                                <p>${item.details.name}</p>
                            </div>
                        </div>
                        <div class="order-popup-items-price">
                            <span>€${item.price}</span>
                        </div>
                    </div>
                `).join("")}
            </div>
        </div>
        <h2 class="order-popup-total">Total: €${data.total_price}</h2>
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

function logoutUser() {
    localStorage.removeItem('authToken');
    window.location.href = '../index.html';
}
  
// Customer service
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

checkServiceFormInputs();

serviceForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const title = document.getElementById("service-title").value.trim();
    const description = document.getElementById("service-description").value.trim();

    if (!title || !description) {
        alert("Both title and description are required.");
        return;
    }

    const formData = {
        title,
        description,
    };

    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${apiUrl}/contacts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error("Failed to submit the service request.");
        }

        const result = await response.json();
        alert("Service request submitted successfully!");
        console.log("Service Request Response:", result);

        // Clear the form after successful submission
        location.reload();

    } catch (error) {
        console.error("Error submitting service request:", error);
        alert("An error occurred while submitting your service request.");
    }
});

// // Fetch all contacts for the user
// const fetchUserContacts = async () => {
//     try {
//         const token = localStorage.getItem("authToken");
//         const response = await fetch(`${apiUrl}/contacts/user`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//             },
//         });

//         if (!response.ok) {
//             throw new Error("Failed to fetch user contacts.");
//         }

//         const contacts = await response.json();
//         console.log("User Contacts:", contacts);
//         return contacts;
//     } catch (error) {
//         console.error("Error fetching user contacts:", error);
//         return [];
//     }
// }

// // Fetch a specific contact by ID
// const fetchContactById = async (contactId) => {
//     try {
//         const token = localStorage.getItem("authToken");
//         const response = await fetch(`${apiUrl}/contacts/${contactId}`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`Failed to fetch contact with ID: ${contactId}`);
//         }

//         const contact = await response.json();
//         console.log("Contact Details:", contact);
//         return contact;
//     } catch (error) {
//         console.error("Error fetching contact by ID:", error);
//         return null;
//     }
// }

const contactsList = document.querySelector(".contacts-list");

// Function to fetch and display user contacts
const fetchAndDisplayContacts = async () => {
    try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${apiUrl}/contacts/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user contacts.");
        }

        const contacts = await response.json();

        // Clear the contacts list
        contactsList.innerHTML = "";

        if (contacts.length === 0) {
            // Display a message if no contacts are found
            const noContactsMessage = document.createElement("p");
            noContactsMessage.textContent = "You have not submitted any contacts yet.";
            noContactsMessage.className = "no-contacts-message";
            contactsList.appendChild(noContactsMessage);
            return;
        }

        // Render each contact
        contacts.forEach(contact => {
            const contactItem = document.createElement("div");
            contactItem.className = "contact-item";
            contactItem.innerHTML = `
                <h3>${contact.title}</h3>
                <p>${contact.description}</p>
                <div class="contact-timeline">
                    <p><strong>Submitted At:</strong> <span>${new Date(contact.created_at).toLocaleString()}</span></p>
                    <p style="color: #F7B41A">${contact.status}</p>
                </div>
            `;
            contactsList.appendChild(contactItem);
        });
    } catch (error) {
        console.error("Error fetching user contacts:", error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "An error occurred while fetching your contacts.";
        errorMessage.className = "error-message";
        contactsList.appendChild(errorMessage);
    }
};

// Call the function to fetch and display contacts
fetchAndDisplayContacts();