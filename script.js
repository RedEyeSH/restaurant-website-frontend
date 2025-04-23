// Login
const navbar_login = document.getElementById("navbar-login");

navbar_login.addEventListener('click', () => {
    document.getElementById("account").classList.toggle("open-account-section");
    document.getElementById("account-container").classList.toggle("account-container-form");

    document.getElementById("box-overlay").classList.toggle("show-box-overlay");
});

const loginForgotPassword = document.getElementById("login-forgot-password");
// loginForgotPassword.addEventListener("click", () => {
//     const loginForm = document.getElementById("login-form");
//     const signupForm = document.getElementById("signup-form");
//     const forgotPasswordForm = document.getElementById("forgot-password-form");

//     loginForm.addEventListener("transitionend", function onLoginTransitionEnd() {
//         loginForm.removeEventListener("transitionend", onLoginTransitionEnd);
//         signupForm.removeEventListener("transitionend", onLoginTransitionEnd);

//         forgotPasswordForm.classList.toggle("open-forgot-password-form");
//         document.querySelector(".open-forgot-password-form").addEventListener("transitionend", function onForgotPasswordTransitionEnd() {
//             loginForm.classList.toggle("slide-up");
//             forgotPasswordForm.removeEventListener("transitionend", onForgotPasswordTransitionEnd);
//             forgotPasswordForm.classList.toggle("slide-left-password-form");
//         });
//     });
// });

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

// const loginForgotPassword = document.getElementById("login-forgot-password");
// loginForgotPassword.addEventListener("click", () => {
//     const loginForm = document.getElementById("login-form");
//     const signupForm = document.getElementById("signup-form");
//     const forgotPasswordForm = document.getElementById("forgot-password-form");

//     loginForm.classList.toggle("slide-left");
//     signupForm.classList.toggle("slide-left");

//     loginForm.addEventListener("transitionend", function onLoginTransitionEnd() {
//         loginForm.removeEventListener("transitionend", onLoginTransitionEnd);
//         signupForm.removeEventListener("transitionend", onLoginTransitionEnd);

//         // loginForm.classList.toggle();
//         forgotPasswordForm.classList.toggle("open-forgot-password-form");
        
//         document.querySelector(".open-forgot-password-form").addEventListener("transitionend", function onForgotPasswordTransitionEnd() {
//             loginForm.classList.toggle("slide-up");
//             forgotPasswordForm.removeEventListener("transitionend", onForgotPasswordTransitionEnd);
//             forgotPasswordForm.classList.toggle("slide-left-password-form");
//         });
//     });
// });

const signupLink = document.getElementById("signup");
signupLink.addEventListener('click', () => {
    document.getElementById("login-form").classList.toggle("close-login-form");
    document.getElementById("signup-form").classList.toggle("show-signup-form");
});

const login_link = document.getElementById("login")
login_link.addEventListener('click', () => {
    document.getElementById("login-form").classList.remove("close-login-form");
    document.getElementById("signup-form").classList.remove("show-signup-form");
});

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