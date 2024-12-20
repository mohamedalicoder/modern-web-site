// Products Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchProduct');
    const sortSelect = document.getElementById('sortProducts');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');

    // Product data
    const products = [
        {
            id: 1,
            name: 'Professional Website Package',
            description: 'Complete website solution for businesses including design, development, and hosting.',
            price: 999.99,
            image_url: '../assets/products/website-package.jpg'
        },
        {
            id: 2,
            name: 'E-commerce Solution',
            description: 'Full-featured online store with payment processing and inventory management.',
            price: 1499.99,
            image_url: '../assets/products/ecommerce.jpg'
        },
        {
            id: 3,
            name: 'Mobile App Development',
            description: 'Custom mobile application development for iOS and Android platforms.',
            price: 2999.99,
            image_url: '../assets/products/mobile-app.jpg'
        },
        {
            id: 4,
            name: 'SEO Package',
            description: 'Comprehensive SEO optimization to improve your website\'s visibility.',
            price: 499.99,
            image_url: '../assets/products/seo-package.jpg'
        },
        {
            id: 5,
            name: 'Cloud Hosting Plan',
            description: 'Scalable cloud hosting solution with 24/7 support and monitoring.',
            price: 99.99,
            image_url: '../assets/products/cloud-hosting.jpg'
        },
        {
            id: 6,
            name: 'Security Suite',
            description: 'Advanced security package including firewall, SSL, and malware protection.',
            price: 299.99,
            image_url: '../assets/products/security.jpg'
        }
    ];

    let currentPage = 1;
    let productsPerPage = 6;
    let filteredProducts = [...products];

    // Filter and sort products
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
        sortProducts();
    }

    function sortProducts() {
        const sortValue = sortSelect.value;
        switch(sortValue) {
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
        }
        currentPage = 1;
        displayProducts();
    }

    // Display products
    function displayProducts() {
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = filteredProducts.slice(start, end);
        
        productGrid.innerHTML = paginatedProducts.map(product => `
            <div class="product-card fade-in">
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn primary" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `).join('');

        // Update pagination
        updatePagination();
    }

    // Pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        currentPageSpan.textContent = currentPage;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
    }

    function nextPage() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts();
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            displayProducts();
        }
    }

    // Cart functionality
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification('Product added to cart!');
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event listeners
    searchInput.addEventListener('input', filterProducts);
    sortSelect.addEventListener('change', sortProducts);
    prevButton.addEventListener('click', prevPage);
    nextButton.addEventListener('click', nextPage);

    // Initial load
    displayProducts();
});
