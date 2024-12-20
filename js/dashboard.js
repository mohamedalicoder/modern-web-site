// Check if user is authenticated
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = '../index.html';
        return;
    }

    loadUserData();
    loadStatistics();
    loadRecentActivity();
});

// Load user data
function loadUserData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
    }
}

// Load user statistics
async function loadStatistics() {
    try {
        const response = await fetch(`${API_URL}/statistics.php`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('totalOrders').textContent = data.statistics.orders || 0;
                document.getElementById('wishlistItems').textContent = data.statistics.wishlist || 0;
                document.getElementById('totalReviews').textContent = data.statistics.reviews || 0;
            }
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const response = await fetch(`${API_URL}/activity.php`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                displayActivity(data.activities);
            }
        }
    } catch (error) {
        console.error('Error loading activity:', error);
        displayActivity([]);
    }
}

// Display activity items
function displayActivity(activities) {
    const activityList = document.getElementById('activityList');
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info"></i>
                </div>
                <div class="activity-content">
                    <h4>No Recent Activity</h4>
                    <p>Your activity will appear here</p>
                </div>
            </li>
        `;
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <li class="activity-item">
            <div class="activity-icon">
                <i class="fas ${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${formatTime(activity.timestamp)}</span>
            </div>
        </li>
    `).join('');
}

// Helper function to get activity icon
function getActivityIcon(type) {
    const icons = {
        'order': 'fa-shopping-cart',
        'review': 'fa-star',
        'wishlist': 'fa-heart',
        'login': 'fa-sign-in-alt',
        'profile': 'fa-user-edit'
    };
    return icons[type] || 'fa-circle';
}

// Format timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Edit profile function
function editProfile() {
    window.location.href = 'profile.html';
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    window.location.href = '../index.html';
}
