document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
        document.querySelector('.auth-required').style.display = 'none';
        document.querySelector('.no-auth').style.display = 'block';
        return;
    }

    // Show authenticated content
    document.querySelector('.auth-required').style.display = 'block';
    document.querySelector('.no-auth').style.display = 'none';

    // Tab switching
    const menuItems = document.querySelectorAll('.menu-item');
    const profileTabs = document.querySelectorAll('.profile-tab');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            
            // Update active states
            menuItems.forEach(mi => mi.classList.remove('active'));
            profileTabs.forEach(tab => tab.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });

    // Load user data
    loadUserProfile();

    // Form submissions
    const profileForm = document.getElementById('profileForm');
    const securityForm = document.getElementById('securityForm');
    const preferencesForm = document.getElementById('preferencesForm');

    profileForm.addEventListener('submit', handleProfileUpdate);
    securityForm.addEventListener('submit', handlePasswordChange);
    preferencesForm.addEventListener('submit', handlePreferencesUpdate);

    // Avatar change
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    changeAvatarBtn.addEventListener('click', handleAvatarChange);

    // Load orders
    loadOrders();
});

// Load user profile data
async function loadUserProfile() {
    try {
        const response = await fetch('../api/profile.php', {
            headers: {
                'Authorization': `Bearer ${Auth.getAuthToken()}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            // Populate form fields
            document.getElementById('name').value = data.user.name;
            document.getElementById('email').value = data.user.email;
            document.getElementById('phone').value = data.user.phone || '';
            document.getElementById('bio').value = data.user.bio || '';
            
            // Set avatar
            if (data.user.avatar_url) {
                document.getElementById('avatarImage').src = data.user.avatar_url;
            }

            // Set preferences
            document.getElementById('emailNotifications').checked = data.preferences.emailNotifications;
            document.getElementById('newsletter').checked = data.preferences.newsletter;
            document.getElementById('theme').value = data.preferences.theme || 'light';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

// Handle profile form submission
async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value
    };

    try {
        const response = await fetch('../api/profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getAuthToken()}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Profile updated successfully', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('../api/change-password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getAuthToken()}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Password changed successfully', 'success');
            e.target.reset();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Failed to change password', 'error');
    }
}

// Handle preferences update
async function handlePreferencesUpdate(e) {
    e.preventDefault();

    const preferences = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        newsletter: document.getElementById('newsletter').checked,
        theme: document.getElementById('theme').value
    };

    try {
        const response = await fetch('../api/preferences.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getAuthToken()}`
            },
            body: JSON.stringify(preferences)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Preferences updated successfully', 'success');
            // Update theme if changed
            if (preferences.theme !== localStorage.getItem('theme')) {
                localStorage.setItem('theme', preferences.theme);
                applyTheme(preferences.theme);
            }
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating preferences:', error);
        showNotification('Failed to update preferences', 'error');
    }
}

// Handle avatar change
function handleAvatarChange() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('../api/upload-avatar.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Auth.getAuthToken()}`
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                document.getElementById('avatarImage').src = data.avatarUrl;
                showNotification('Avatar updated successfully', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showNotification('Failed to upload avatar', 'error');
        }
    };

    input.click();
}

// Load order history
async function loadOrders() {
    try {
        const response = await fetch('../api/orders.php', {
            headers: {
                'Authorization': `Bearer ${Auth.getAuthToken()}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = '';

            if (data.orders.length === 0) {
                ordersList.innerHTML = '<p>No orders found.</p>';
                return;
            }

            data.orders.forEach(order => {
                const orderElement = document.createElement('div');
                orderElement.className = 'order-item';
                orderElement.innerHTML = `
                    <div class="order-header">
                        <h3>Order #${order.id}</h3>
                        <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p>Total: $${order.total.toFixed(2)}</p>
                        <button class="btn secondary" onclick="viewOrderDetails(${order.id})">View Details</button>
                    </div>
                `;
                ordersList.appendChild(orderElement);
            });
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Failed to load orders', 'error');
    }
}

// View order details
window.viewOrderDetails = async (orderId) => {
    try {
        const response = await fetch(`../api/order-details.php?id=${orderId}`, {
            headers: {
                'Authorization': `Bearer ${Auth.getAuthToken()}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            // Implement order details modal or navigation
            console.log('Order details:', data.order);
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Failed to load order details', 'error');
    }
};

// Notification helper
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Theme helper
function applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
}
