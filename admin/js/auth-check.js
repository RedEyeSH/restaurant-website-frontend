// Utility function to check if the user is logged in and has the admin role
function checkUserAuthentication() {
    console.log('Checking user authentication...');
    const token = localStorage.getItem('authToken');

    if (!token) {
        // If not logged in, redirect to login page
        window.location.href = '../login';
        return;
    }

    try {
        // Decode the JWT token (assuming it contains the user role and expiration)
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode JWT token (base64)
        const role = decodedToken.role;
        const exp = decodedToken.exp;

        // Check if the token has expired
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        if (exp && currentTime > exp) {
            console.error('Token has expired.');
            window.location.href = '../login';
            return;
        }

        if (role !== 'admin') {
            // If the role is not 'admin', redirect to a general page or login
            window.location.href = '../login';
        }
    } catch (error) {
        console.error('Invalid token format:', error);
        window.location.href = '../login';
    }
}


function logout() {
    localStorage.removeItem('authToken'); // Remove the token from local storage
    window.location.href = '../login'; // Redirect to login page after logout
}


export default checkUserAuthentication;
export { logout, checkUserAuthentication };