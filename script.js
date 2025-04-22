// Login
const navbar_login = document.getElementById("navbar-login");

navbar_login.addEventListener('click', () => {
    document.getElementById("account").classList.toggle("open-account-section");
    document.getElementById("account-container").classList.toggle("account-container-login");

    document.getElementById("box-overlay").classList.toggle("show-box-overlay");
});

const signup_form = document.getElementById("signup");
signup_form.addEventListener('click', () => {
    document.getElementById("login-form").classList.toggle("close-login-form");
    document.getElementById("signup-form").classList.toggle("show-signup-form");
});

const login_form = document.getElementById("login")
login_form.addEventListener('click', () => {
    document.getElementById("login-form").classList.remove("close-login-form");
    document.getElementById("signup-form").classList.remove("show-signup-form");
});

// Handling for closing forms
function closeForms() {
    document.getElementById("box-overlay").classList.remove("show-box-overlay");
    document.getElementById("account-container").classList.remove("account-container-login");
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


