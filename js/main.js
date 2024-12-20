// DOM Elements
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const closeButtons = document.querySelectorAll('.close');
const closeSignup = document.getElementById('closeSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Mobile Menu Toggle
mobileMenuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// Modal Functions
function showModal(modal) {
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.style.display = 'none';
}

// Event Listeners for Modals
loginBtn.addEventListener('click', () => showModal(loginModal));
signupBtn.addEventListener('click', () => showModal(signupModal));

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        hideModal(loginModal);
        hideModal(signupModal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) hideModal(loginModal);
    if (e.target === signupModal) hideModal(signupModal);
});

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function showError(field, message) {
    const input = document.getElementById(field);
    if (!input) return;

    const existingError = input.parentElement.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function clearErrors() {
    document.querySelectorAll('.error').forEach(error => error.remove());
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!validateEmail(email)) {
        showError('loginEmail', 'Please enter a valid email address');
        return;
    }

    try {
        const response = await login(email, password);
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('auth_token', response.token);
            showNotification('Login successful! Redirecting...');
            hideModal(loginModal);
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 1500);
        } else {
            showError('loginEmail', response.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
    }
});

// Signup Form Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate inputs
    let hasError = false;

    if (!name) {
        showError('signupName', 'Name is required');
        hasError = true;
    }

    if (!validateEmail(email)) {
        showError('signupEmail', 'Please enter a valid email address');
        hasError = true;
    }

    if (!validatePassword(password)) {
        showError('signupPassword', 'Password must be at least 6 characters long');
        hasError = true;
    }

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasError = true;
    }

    if (hasError) return;

    try {
        const response = await signup({ name, email, password });
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('auth_token', response.token);
            showNotification('Registration successful! Redirecting...');
            hideModal(signupModal);
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 1500);
        } else {
            showNotification(response.message || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('An error occurred. Please try again later.', 'error');
    }
});

// Feature Cards Data
const features = [
    {
        title: 'Responsive Design',
        description: 'Works perfectly on all devices',
        icon: 'desktop'
    },
    {
        title: 'Secure Authentication',
        description: 'Safe and reliable user authentication',
        icon: 'lock'
    },
    {
        title: 'Fast Performance',
        description: 'Optimized for speed and efficiency',
        icon: 'bolt'
    }
];

// Load Feature Cards
function loadFeatures() {
    const featureGrid = document.querySelector('.feature-grid');
    if (!featureGrid) return;

    features.forEach(feature => {
        const card = document.createElement('div');
        card.className = 'feature-card fade-in';
        card.innerHTML = `
            <i class="fas fa-${feature.icon}"></i>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        `;
        featureGrid.appendChild(card);
    });
}

// Initialize Features
document.addEventListener('DOMContentLoaded', loadFeatures);

// Check Authentication Status
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        // Update UI for logged-in user
        document.querySelectorAll('.auth-required').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.no-auth').forEach(el => el.style.display = 'none');
    }
}

// Initialize Auth Check
checkAuth();
