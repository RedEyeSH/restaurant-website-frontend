// Utility function to check if the user is logged in and has the admin role
function checkUserAuthentication() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        // If not logged in, redirect to login page
        window.location.href = '../login' ;
        return;
    }

    // Decode the JWT token (assuming it contains the user role)
    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token (base64)
    const role = decodedToken.role;

    if (role !== 'admin') {
        // If the role is not 'admin', redirect to a general page or login
        window.location.href = 'login.html';
    }
}


function logout() {
    localStorage.removeItem('authToken'); // Remove the token from local storage
    window.location.href = '../login'; // Redirect to login page after logout
}


export default checkUserAuthentication;
export { logout, checkUserAuthentication };