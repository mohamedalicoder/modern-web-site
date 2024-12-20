document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Validate form data
        if (!validateForm(formData)) {
            return;
        }

        try {
            const response = await sendMessage(formData);
            if (response.success) {
                showNotification('Message sent successfully!', 'success');
                contactForm.reset();
            } else {
                showNotification('Failed to send message. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('An error occurred. Please try again later.', 'error');
        }
    });

    // Form validation
    function validateForm(data) {
        const errors = [];

        if (!data.name.trim()) {
            errors.push('Name is required');
        }

        if (!data.email.trim()) {
            errors.push('Email is required');
        } else if (!validateEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!data.subject.trim()) {
            errors.push('Subject is required');
        }

        if (!data.message.trim()) {
            errors.push('Message is required');
        }

        if (errors.length > 0) {
            errors.forEach(error => showNotification(error, 'error'));
            return false;
        }

        return true;
    }

    // Email validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Send message to API
    async function sendMessage(data) {
        try {
            const response = await fetch('../api/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize map if available
    function initMap() {
        const mapElement = document.getElementById('map');
        if (mapElement && typeof google !== 'undefined') {
            const location = { lat: 37.4419, lng: -122.1419 }; // Silicon Valley coordinates
            const map = new google.maps.Map(mapElement, {
                zoom: 13,
                center: location
            });

            new google.maps.Marker({
                position: location,
                map: map,
                title: 'Our Office'
            });
        }
    }

    // Load Google Maps if available
    if (typeof google !== 'undefined') {
        initMap();
    }
});
