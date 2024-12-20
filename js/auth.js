// Authentication Service
const API_URL = 'http://localhost/php-reiman/api';

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('auth_token') !== null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Login Function
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Login response:', data);
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Signup Function
async function signup(userData) {
    try {
        console.log('Attempting signup with:', userData);
        const response = await fetch(`${API_URL}/signup.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        console.log('Signup response:', data);
        return data;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    window.location.href = '../index.html';
}

// Export functions for use in other files
window.Auth = {
    login,
    signup,
    logout,
    isAuthenticated,
    getAuthToken
};
