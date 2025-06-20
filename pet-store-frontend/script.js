// --- NEW/MODIFIED SECTION: API Base URL ---
const API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your backend URL
// --- END NEW/MODIFIED SECTION ---

document.addEventListener('DOMContentLoaded', () => {

    // --- NEW: Process URL parameters from Google OAuth Redirect (MUST BE FIRST) ---
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const nameFromUrl = urlParams.get('name');
    const emailFromUrl = urlParams.get('email');
    const errorFromUrl = urlParams.get('error');

    if (tokenFromUrl && nameFromUrl) {
        // If we have token, name, and email from URL, store them in localStorage
        localStorage.setItem('token', tokenFromUrl);
        localStorage.setItem('userName', decodeURIComponent(nameFromUrl));
        if (emailFromUrl) {
            localStorage.setItem('userEmail', decodeURIComponent(emailFromUrl));
        } else {
            localStorage.removeItem('userEmail'); // Ensure old email is cleared if not sent
        }

        // Clean the URL by removing the query parameters
        // This is crucial to prevent re-processing on refresh and for cleaner URLs
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // Show success message
        showMessage('success', `Welcome, ${decodeURIComponent(nameFromUrl)}! You are logged in.`);
        // Optionally, redirect to home or profile page after successful login via Google
        // showSection('home'); // Or 'profile'
    } else if (errorFromUrl) {
        showMessage('error', `Login failed: ${decodeURIComponent(errorFromUrl)}`);
        // Clean the URL to remove error parameter
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        showSection('login'); // Redirect back to login on error
    }
    // --- END NEW ---

    // --- DOM Elements ---
    const sections = {
        home: document.getElementById('home-section'),
        dogs: document.getElementById('dogs-section'),
        cats: document.getElementById('cats-section'),
        accessories: document.getElementById('accessories-section'),
        toys: document.getElementById('toys-section'), // New category
        grooming: document.getElementById('grooming-section'),
        costumes: document.getElementById('costumes-section'),
        productDetail: document.getElementById('product-detail-section'),
        cart: document.getElementById('cart-section'),
        checkout: document.getElementById('checkout-section'),
        login: document.getElementById('login-section'),    // NEW
        register: document.getElementById('register-section'), // NEW
        profile: document.getElementById('profile-section') // NEW: Added profile section
    };

    const navLinks = document.querySelectorAll('nav ul li a, .logo, .hero-banner button, .cart-icon, .sidebar-menu a');
    const productGrids = {
        featured: document.getElementById('featured-products'),
        dog: document.getElementById('dog-products'),
        cat: document.getElementById('cat-products'),
        accessories: document.getElementById('accessories-products'),
        toys: document.getElementById('toys-products'),
        grooming: document.getElementById('grooming-products'),
        costumes: document.getElementById('costumes-products')
    };
    const productDetailContent = document.getElementById('product-detail-content');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const backToProductsBtn = document.getElementById('backToProductsBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const cartCountSpans = document.querySelectorAll('#cart-count, #sidebar-cart-count'); // Select both
    const loginForm = document.getElementById('login-form'); // NEW
    const registerForm = document.getElementById('register-form'); // NEW
    const loginErrorMessage = document.getElementById('login-error-message'); // NEW
    const registerErrorMessage = document.getElementById('register-error-message'); // NEW
    const registerSuccessMessage = document.getElementById('register-success-message'); // NEW
    const navLoginLink = document.getElementById('nav-login-link'); // NEW
    const navRegisterLink = document.getElementById('nav-register-link'); // NEW
    const sidebarLoginLink = document.getElementById('sidebar-login-link'); // NEW
    const sidebarRegisterLink = document.getElementById('sidebar-register-link'); // NEW
    const navUserMenu = document.getElementById('nav-user-menu'); // NEW
    const navUserName = document.getElementById('nav-user-name'); // NEW
    const navLogoutLink = document.getElementById('nav-logout-link'); // NEW
    const sidebarUserMenu = document.getElementById('sidebar-user-menu'); // NEW
    const sidebarUserName = document.getElementById('sidebar-user-name'); // NEW
    const sidebarLogoutLink = document.getElementById('sidebar-logout-link'); // NEW
    const profileNameSpan = document.getElementById('profile-name'); // NEW
    const profileEmailSpan = document.getElementById('profile-email'); // NEW
    const profileRoleSpan = document.getElementById('profile-role'); // NEW
    const profileOrdersDiv = document.getElementById('profile-orders'); // NEW
    const backToHomeFromProfileBtn = document.getElementById('backToHomeFromProfileBtn'); // NEW

    // NEW: Google Login/Register Buttons
    const googleLoginButtonModal = document.getElementById('google-login-button-modal'); // Assuming you might have one in a modal
    const googleLoginButtonSection = document.getElementById('google-login-button-section'); // For the login section
    const googleRegisterButtonModal = document.getElementById('google-login-button-register-modal'); // Assuming for a register modal
    const googleRegisterButtonSection = document.getElementById('google-login-button-register-section'); // For the register section

    // --- Global Variables ---
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentUser = JSON.parse(localStorage.getItem('userInfo')); // NEW

    // --- Utility Functions ---

    function showMessage(type, message) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('app-message', type);
        messageContainer.textContent = message;
        document.body.appendChild(messageContainer);

        // Remove message after a few seconds
        setTimeout(() => {
            messageContainer.remove();
        }, 3000);
    }

    // Function to update authentication UI (login/register vs. user menu)
    function updateAuthUI() {
        if (currentUser && currentUser.token) {
            // User is logged in
            if (navLoginLink) navLoginLink.classList.add('hidden');
            if (navRegisterLink) navRegisterLink.classList.add('hidden');
            if (navUserMenu) {
                navUserMenu.classList.remove('hidden');
                if (navUserName && currentUser.name) {
                    navUserName.textContent = `Hello, ${currentUser.name.split(' ')[0]}!`;
                }
            }

            if (sidebarLoginLink) sidebarLoginLink.classList.add('hidden');
            if (sidebarRegisterLink) sidebarRegisterLink.classList.add('hidden');
            if (sidebarUserMenu) {
                sidebarUserMenu.classList.remove('hidden');
                if (sidebarUserName && currentUser.name) {
                    sidebarUserName.textContent = `Hello, ${currentUser.name.split(' ')[0]}!`;
                }
            }
        } else {
            // User is logged out
            if (navLoginLink) navLoginLink.classList.remove('hidden');
            if (navRegisterLink) navRegisterLink.classList.remove('hidden');
            if (navUserMenu) navUserMenu.classList.add('hidden');

            if (sidebarLoginLink) sidebarLoginLink.classList.remove('hidden');
            if (sidebarRegisterLink) sidebarRegisterLink.classList.remove('hidden');
            if (sidebarUserMenu) sidebarUserMenu.classList.add('hidden');
        }
    }


    // Function to show/hide sections
    function showSection(sectionId) {
        Object.values(sections).forEach(section => {
            if (section) { // Ensure section element exists
                section.classList.add('hidden');
            }
        });
        if (sections[sectionId]) {
            sections[sectionId].classList.remove('hidden');
        }
        // Scroll to top of the main content area for better UX
        document.querySelector('main').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Function to update cart count display
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountSpans.forEach(span => {
            span.textContent = count;
        });
    }

    // Function to render products in a specified grid
    function renderProducts(productsToRender, gridElement) {
        if (!gridElement) {
            console.error("Product grid element not found:", gridElement);
            return;
        }
        gridElement.innerHTML = ''; // Clear previous products
        if (productsToRender.length === 0) {
            gridElement.innerHTML = '<p class="no-products-message">No products found matching your criteria.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="product-price">₹ ${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description.substring(0, 70)}...</p>
                <div class="product-actions">
                    <button class="btn-primary add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
                    <button class="btn-secondary view-details-btn" data-product-id="${product._id}">Details</button>
                </div>
            `;
            gridElement.appendChild(productCard);
        });

        // Attach event listeners to newly rendered buttons
        gridElement.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                addToCart(productId);
            });
        });

        gridElement.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                renderProductDetail(productId);
            });
        });
    }

    // Function to fetch products from API
    async function fetchProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            products = data; // Store fetched products globally

            // Render featured products (first 8 or so)
            renderProducts(products.filter(p => p.isFeatured).slice(0, 8), productGrids.featured);

            // Render products for each category section
            renderProducts(products.filter(p => p.category === 'dog'), productGrids.dog);
            renderProducts(products.filter(p => p.category === 'cat'), productGrids.cat);
            renderProducts(products.filter(p => p.category === 'accessories'), productGrids.accessories);
            renderProducts(products.filter(p => p.category === 'toy'), productGrids.toys); // Ensure 'toy' matches category field in product data
            renderProducts(products.filter(p => p.category === 'grooming'), productGrids.grooming);
            renderProducts(products.filter(p => p.category === 'costume'), productGrids.costumes);


            populateFilterOptions(); // Populate filters after products are loaded
        } catch (error) {
            console.error('Error fetching products:', error);
            // Display a user-friendly message
            if (productGrids.featured) {
                productGrids.featured.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
            }
            // Also update other grids to show error
            Object.values(productGrids).forEach(grid => {
                if (grid && grid.innerHTML.includes('Loading')) { // Only if still showing loading message
                    grid.innerHTML = '<p class="error-message">Failed to load products.</p>';
                }
            });
        }
    }

    // Function to render product detail page
    function renderProductDetail(productId) {
        const product = products.find(p => p._id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        productDetailContent.innerHTML = `
            <div class="product-detail-card">
                <img src="${product.imageUrl || 'https://via.placeholder.com/300?text=No+Image'}" alt="${product.name}">
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="detail-price">₹ ${product.price.toFixed(2)}</p>
                    <p class="detail-description">${product.description}</p>
                    <p class="detail-category">Category: ${product.category}</p>
                    ${product.subCategory ? `<p class="detail-subcategory">Subcategory: ${product.subCategory}</p>` : ''}
                    <button class="btn-primary add-to-cart-btn" data-product-id="${product._id}">Add to Cart</button>
                </div>
            </div>
        `;
        showSection('productDetail');

        // Attach add to cart listener for the detail page button
        productDetailContent.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
            addToCart(e.target.dataset.productId);
        });
    }

    // Function to add product to cart
    function addToCart(productId) {
        const product = products.find(p => p._id === productId);
        if (product) {
            const existingItem = cart.find(item => item._id === productId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product,
                    quantity: 1
                });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showMessage('success', `${product.name} added to cart!`);
        }
    }

    // Function to render cart items
    function renderCart() {
        cartItemsContainer.innerHTML = ''; // Clear existing items
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            cartTotalSpan.textContent = '₹ 0.00';
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        let total = 0;
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.innerHTML = `
                <img src="${item.imageUrl || 'https://via.placeholder.com/50?text=No+Image'}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₹ ${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="item-actions">
                    <button class="quantity-btn decrease" data-product-id="${item._id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-product-id="${item._id}">+</button>
                    <button class="remove-from-cart-btn" data-product-id="${item._id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
            total += item.price * item.quantity;
        });

        cartTotalSpan.textContent = `₹ ${total.toFixed(2)}`;

        // Attach event listeners for quantity change and remove
        cartItemsContainer.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                changeQuantity(e.target.dataset.productId, -1);
            });
        });
        cartItemsContainer.querySelectorAll('.quantity-btn.increase').forEach(button => {
            button.addEventListener('click', (e) => {
                changeQuantity(e.target.dataset.productId, 1);
            });
        });
        cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                removeFromCart(e.target.dataset.productId);
            });
        });
    }

    // Function to change item quantity in cart
    function changeQuantity(productId, delta) {
        const item = cart.find(i => i._id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                renderCart(); // Re-render cart to show updated quantities
            }
        }
    }

    // Function to remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item._id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart(); // Re-render cart
        showMessage('info', 'Item removed from cart.');
    }

    // --- Filter Functions ---
    function applyFiltersToCategory(category) {
        const searchInput = document.getElementById(`${category}-search-input`);
        const categoryFilter = document.getElementById(`${category}-category-filter`);
        const priceRange = document.getElementById(`${category}-price-range`);
        const gridElement = productGrids[category];

        if (!searchInput || !categoryFilter || !priceRange || !gridElement) {
            console.error(`Filter elements for ${category} not found.`);
            return;
        }

        const searchTerm = searchInput.value.toLowerCase();
        const selectedSubCategory = categoryFilter.value;
        const maxPrice = parseFloat(priceRange.value);

        let filteredProducts = products.filter(p => p.category === category);

        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        if (selectedSubCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.subCategory === selectedSubCategory);
        }

        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);

        renderProducts(filteredProducts, gridElement);
    }


    // Function to populate filter options dynamically
    function populateFilterOptions() {
        const allCategories = ['dog', 'cat', 'accessories', 'toys', 'grooming', 'costumes']; // All your defined categories

        allCategories.forEach(cat => {
            const selectElement = document.getElementById(`${cat}-category-filter`);
            if (selectElement) {
                // Clear existing options except 'All'
                selectElement.innerHTML = '<option value="all">All</option>';

                const subCategories = [...new Set(products
                    .filter(p => p.category === cat && p.subCategory)
                    .map(p => p.subCategory)
                )];

                subCategories.sort().forEach(subCat => {
                    const option = document.createElement('option');
                    option.value = subCat;
                    option.textContent = subCat.charAt(0).toUpperCase() + subCat.slice(1);
                    selectElement.appendChild(option);
                });
            }
        });
    }


    // --- Event Listeners ---

    // Navigation and sidebar links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = e.target.dataset.section || e.target.closest('a').dataset.section;
            if (sectionId) {
                e.preventDefault();
                showSection(sectionId);
                // Specific actions for certain sections
                if (sectionId === 'cart') {
                    renderCart();
                } else if (sectionId === 'profile') { // NEW: Handle profile section
                    renderProfile();
                }
                // Close sidebar if open
                sidebarMenu.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    });

    // Back button on product detail page
    if (backToProductsBtn) {
        backToProductsBtn.addEventListener('click', () => {
            // Determine which category section to go back to based on the product viewed
            // For now, let's go back to the home section, or you can store the last category visited
            showSection('home');
        });
    }

    // Back button on profile page
    if (backToHomeFromProfileBtn) { // NEW
        backToHomeFromProfileBtn.addEventListener('click', () => {
            showSection('home');
        });
    }

    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebarMenu.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebarMenu.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebarMenu.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showSection('checkout');
            // Optional: pre-fill checkout form if user is logged in
        });
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage('info', 'Processing your order...');

            // In a real application, you would send cart data and shipping info to your backend
            // For this example, we'll just simulate success
            try {
                // Simulate API call
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token
                    },
                    body: JSON.stringify({
                        cartItems: cart,
                        shippingInfo: {
                            fullName: document.getElementById('fullName').value,
                            address: document.getElementById('address').value,
                            city: document.getElementById('city').value,
                            zipCode: document.getElementById('zipCode').value
                        },
                        paymentInfo: {
                            cardNumber: document.getElementById('cardNumber').value,
                            expiryDate: document.getElementById('expiryDate').value,
                            cvv: document.getElementById('cvv').value
                        }
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('success', data.msg || 'Order placed successfully!');
                    cart = []; // Clear cart
                    localStorage.removeItem('cart');
                    updateCartCount();
                    checkoutForm.reset(); // Clear form
                    showSection('home'); // Redirect to home
                } else {
                    showMessage('error', data.msg || 'Order placement failed.');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                showMessage('error', 'Network error during checkout. Please try again.');
            }
        });
    }

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginErrorMessage.classList.add('hidden'); // Hide previous errors
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    currentUser = data; // Update global current user
                    updateAuthUI();
                    loginForm.reset();
                    showMessage('success', data.msg || 'Login successful!');
                    showSection('home'); // Redirect to home
                } else {
                    displayFormMessage(loginErrorMessage, data.msg || 'Login failed. Invalid credentials.', false);
                }
            } catch (error) {
                console.error('Login network error:', error);
                displayFormMessage(loginErrorMessage, 'Network error. Please try again.', false);
            }
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            registerErrorMessage.classList.add('hidden'); // Hide previous errors
            registerSuccessMessage.classList.add('hidden'); // Hide previous success
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                displayFormMessage(registerErrorMessage, 'Passwords do not match.', false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    displayFormMessage(registerSuccessMessage, data.msg || 'Registration successful! You can now login.', true);
                    registerForm.reset();
                    // Optionally, redirect to login page after successful registration
                    showSection('login');
                } else {
                    displayFormMessage(registerErrorMessage, data.msg || 'Registration failed.', false);
                }
            } catch (error) {
                console.error('Register network error:', error);
                displayFormMessage(registerErrorMessage, 'Network error. Please try again.', false);
            }
        });
    }

    // Helper to display form messages
    function displayFormMessage(element, message, isSuccess) {
        element.textContent = message;
        element.classList.remove('hidden');
        if (isSuccess) {
            element.classList.remove('error-message');
            element.classList.add('success-message');
        } else {
            element.classList.remove('success-message');
            element.classList.add('error-message');
        }
    }

    // --- Profile Section Logic (NEW) ---
    async function renderProfile() {
        if (!currentUser || !currentUser.token) {
            showMessage('error', 'You need to be logged in to view your profile.');
            showSection('login');
            return;
        }

        if (profileNameSpan) profileNameSpan.textContent = currentUser.name || 'N/A';
        if (profileEmailSpan) profileEmailSpan.textContent = currentUser.email || 'N/A';
        if (profileRoleSpan) profileRoleSpan.textContent = currentUser.role || 'user';

        // Fetch user's orders
        if (profileOrdersDiv) {
            profileOrdersDiv.innerHTML = '<p class="loading-message">Loading orders...</p>';
            try {
                const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.orders && data.orders.length > 0) {
                        profileOrdersDiv.innerHTML = ''; // Clear loading message
                        data.orders.forEach(order => {
                            const orderElement = document.createElement('div');
                            orderElement.classList.add('order-item');
                            const orderDate = new Date(order.createdAt).toLocaleDateString();
                            const orderTotal = order.totalPrice.toFixed(2);
                            orderElement.innerHTML = `
                                <h4>Order ID: ${order._id}</h4>
                                <p>Date: ${orderDate}</p>
                                <p>Total: ₹ ${orderTotal}</p>
                                <div class="order-products">
                                    <h5>Items:</h5>
                                    <ul>
                                        ${order.items.map(item => `<li>${item.name} (x${item.quantity}) - ₹ ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
                                    </ul>
                                </div>
                            `;
                            profileOrdersDiv.appendChild(orderElement);
                        });
                    } else {
                        profileOrdersDiv.innerHTML = '<p>No orders found.</p>';
                    }
                } else {
                    profileOrdersDiv.innerHTML = `<p class="error-message">Failed to load orders: ${data.msg || 'Unknown error'}</p>`;
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                profileOrdersDiv.innerHTML = '<p class="error-message">Network error: Could not load orders.</p>';
            }
        }
    }

    // Logout functionality
    function logoutUser() {
        localStorage.removeItem('userInfo'); // Clear user info
        currentUser = null; // Clear local variable
        cart = []; // Clear cart on logout
        localStorage.removeItem('cart'); // Clear cart from localStorage
        updateCartCount(); // Update cart count
        updateAuthUI(); // Update UI
        showSection('home'); // Redirect to home
        showMessage('success', 'You have been logged out.'); // Changed alert to showMessage
    }

    // Attach logout event listeners
    if (navLogoutLink) {
        navLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }
    if (sidebarLogoutLink) {
        sidebarLogoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    }

    // --- NEW/MODIFIED SECTION: Google Login/Register Button Event Listeners ---
    if (googleLoginButtonModal) {
        googleLoginButtonModal.addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/google`; // Redirect to your backend's Google auth initiation
        });
    }

    if (googleLoginButtonSection) {
        googleLoginButtonSection.addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/google`;
        });
    }

    if (googleRegisterButtonModal) {
        googleRegisterButtonModal.addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/google`;
        });
    }

    if (googleRegisterButtonSection) {
        googleRegisterButtonSection.addEventListener('click', () => {
            window.location.href = `${API_BASE_URL}/auth/google`;
        });
    }
    // --- END NEW/MODIFIED SECTION ---


    // --- Initial Setup (ensure correct order) ---
    fetchProducts(); // Fetch products first
    updateAuthUI(); // Then update UI based on any existing login state
    showSection('home'); // Show the home section
    updateCartCount(); // Update cart count on load
    // populateFilterOptions(); // This is now called inside fetchProducts after products are loaded
});