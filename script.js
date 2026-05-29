const products = [
    { id: 1, name: 'ISO-GLOW WHEY PROTEIN', price: 49.99, image: 'protein.png' },
    { id: 2, name: 'CREATINE MONOHYDRATE', price: 24.99, image: 'creatine.png' },
    { id: 3, name: 'HYPERVOLT ELITE PRE-WORKOUT', price: 39.99, image: 'preworkout.png' },
    { id: 4, name: 'DAILY VITALITY MULTIVITAMIN', price: 19.99, image: 'vitamins.png' },
    { id: 5, name: 'PREMIUM SHAKER BOTTLE', price: 14.99, image: 'shaker.png' },
    { id: 6, name: 'MASS GAINER EXTREME', price: 54.99, image: 'mass_gainer_new.png' },
    { id: 7, name: 'PURE CASEIN WHEY', price: 59.99, image: 'protein.png' },
    { id: 8, name: 'VEGAN PEA PROTEIN', price: 45.99, image: 'protein.png' },
    { id: 9, name: 'BEEF PROTEIN ISOLATE', price: 64.99, image: 'protein.png' },
    { id: 10, name: 'CREATINE HCL CAPSULES', price: 29.99, image: 'creatine.png' },
    { id: 11, name: 'MICRONIZED CREATINE POWDER', price: 22.99, image: 'creatine.png' },
    { id: 12, name: 'NITRIC OXIDE BOOSTER', price: 34.99, image: 'preworkout.png' },
    { id: 13, name: 'STIM-FREE PUMP MAX', price: 37.99, image: 'preworkout.png' },
    { id: 14, name: 'OMEGA 3 FISH OIL', price: 18.99, image: 'omega3_new.png' },
    { id: 15, name: 'ZMA RECOVERY COMPLEX', price: 21.99, image: 'vitamins.png' },
    { id: 16, name: 'STAINLESS STEEL SHAKER', price: 24.99, image: 'shaker.png' },
    { id: 17, name: 'GYM TOWEL MICROFIBER', price: 12.99, image: 'shaker.png' },
    { id: 18, name: 'LIFTING STRAPS PRO', price: 15.99, image: 'shaker.png' },
    { id: 19, name: 'BCAA RECOVERY', price: 52.99, image: 'bcaa_new.png' },
    { id: 20, name: 'NIGHT TIME CASEIN', price: 48.99, image: 'protein.png' },
    { id: 21, name: 'KRE-ALKALYN ELITE', price: 32.99, image: 'creatine.png' },
    { id: 22, name: 'CELL-VOL CREATINE MATRIX', price: 35.99, image: 'creatine.png' },
    { id: 23, name: 'EXTREME ENERGY PRE-WORKOUT', price: 42.99, image: 'preworkout.png' },
    { id: 24, name: 'ADRENALINE RUSH POWDER', price: 38.99, image: 'preworkout.png' },
    { id: 25, name: 'VITAMIN D3 + K2', price: 16.99, image: 'fishoil_alt.png' },
    { id: 26, name: 'JOINT SUPPORT MATRIX', price: 27.99, image: 'vitamins.png' },
    { id: 27, name: 'L-CARNITINE FAT BURNER', price: 28.99, image: 'preworkout.png' },
    { id: 28, name: 'ASHWAGANDHA EXTRACT', price: 19.99, image: 'vitamins.png' },
    { id: 29, name: 'MACA ROOT POWDER', price: 17.99, image: 'vitamins.png' },
    { id: 30, name: 'PROBIOTIC DIGEST', price: 25.99, image: 'vitamins.png' },
    { id: 31, name: 'LIQUID CREATINE SHOT', price: 3.99, image: 'creatine.png' },
    { id: 32, name: 'BETA-ALANINE ENDURANCE', price: 23.99, image: 'bcaa_alt.png' },
    { id: 33, name: 'CAFFEINE + TAURINE SHOT', price: 2.99, image: 'preworkout.png' },
    { id: 34, name: 'WEIGHT REDUCTION BELT', price: 19.99, image: 'shaker.png' },
    { id: 35, name: 'GALLON WATER JUG', price: 14.99, image: 'shaker.png' },
    { id: 36, name: 'TESTOSTERONE BOOSTER PRO', price: 49.99, image: 'vitamins.png' }
];
const API_URL = 'http://localhost:3000/api';
let currentUser = localStorage.getItem('currentUser');

// Cart storage: Guests use localStorage, Logged-in users use both (sync to DB)
function getLocalCartKey() {
    return currentUser ? `cart_${currentUser}` : 'cart';
}

let cart = JSON.parse(localStorage.getItem(getLocalCartKey())) || [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');

// Auth DOM
const authModal = document.getElementById('auth-modal');
const loginBtn = document.getElementById('login-btn');
const userDisplay = document.getElementById('user-display');
const modalTitle = document.getElementById('modal-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authToggleLink = document.getElementById('auth-toggle-link');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const authError = document.getElementById('auth-error');

let isLoginMode = true;

// Auth Functions
function toggleAuthModal() {
    if (authModal) authModal.classList.toggle('active');
    if (authError) authError.style.display = 'none';
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        modalTitle.innerText = 'Login';
        authSubmitBtn.innerText = 'Login';
        authToggleText.innerText = "Don't have an account?";
        authToggleLink.innerText = 'Register';
    } else {
        modalTitle.innerText = 'Register';
        authSubmitBtn.innerText = 'Register';
        authToggleText.innerText = 'Already have an account?';
        authToggleLink.innerText = 'Login';
    }
    authError.style.display = 'none';
}

async function handleAuth() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        authError.innerText = 'Please fill all fields.';
        authError.style.display = 'block';
        return;
    }

    const endpoint = isLoginMode ? '/login' : '/register';

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            loginUser(username);
        } else {
            authError.innerText = data.error || 'Authentication failed.';
            authError.style.display = 'block';
        }
    } catch (error) {
        console.error('Auth error:', error);
        authError.innerText = 'Server error. Is the backend running?';
        authError.style.display = 'block';
    }
}

async function loginUser(username) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
    toggleAuthModal();
    updateUserDisplay();

    // Fetch cart from database
    try {
        const response = await fetch(`${API_URL}/cart/${username}`);
        if (response.ok) {
            const productIds = await response.json();
            // Convert IDs back to product objects
            cart = productIds.map(id => products.find(p => p.id === id)).filter(p => p);
            // Also store in localStorage for persistence
            localStorage.setItem(getLocalCartKey(), JSON.stringify(cart));
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }

    updateCart();
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserDisplay();
    // Load guest cart from local storage
    cart = JSON.parse(localStorage.getItem(getLocalCartKey())) || [];
    updateCart();
}

function updateUserDisplay() {
    const ordersNavLink = document.getElementById('orders-nav-link');
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDisplay) {
            userDisplay.style.display = 'block';
            userDisplay.innerHTML = `${currentUser} <span style="font-size: 0.8rem; margin-left: 0.5rem; cursor: pointer; color: var(--text-secondary);" onclick="logoutUser()">[Logout]</span>`;
        }
        if (ordersNavLink) ordersNavLink.style.display = 'inline-block';
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userDisplay) userDisplay.style.display = 'none';
        if (ordersNavLink) ordersNavLink.style.display = 'none';
    }
    // Render order history if on orders page
    renderOrdersHistory();
}

// Render Products
function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'" style="cursor: pointer;">
            <img src="img/${product.image}" alt="${product.name}" class="product-img">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
        </div>
    `).join('');
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCart();

    // Simple visual feedback
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = 'Added!';
    btn.style.background = 'var(--accent-primary)';
    btn.style.color = 'var(--bg-dark)';
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-primary)';
    }, 1000);
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Update Cart Display
async function updateCart() {
    // Save to local storage
    localStorage.setItem(getLocalCartKey(), JSON.stringify(cart));

    // Save to database if logged in
    if (currentUser) {
        try {
            await fetch(`${API_URL}/cart/${currentUser}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: cart.map(p => p.id) })
            });
        } catch (error) {
            console.error('Error saving cart to DB:', error);
        }
    }

    // Update count
    if (cartCount) cartCount.innerText = cart.length;

    // Update total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (cartTotal) cartTotal.innerText = `$${total.toFixed(2)}`;

    // Update items list
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">Your cart is empty.</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <img src="img/${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">&times;</button>
                </div>
            `).join('');
        }
    }
}

// Toggle Cart Sidebar
function toggleCart() {
    if (cartSidebar) cartSidebar.classList.toggle('active');
    if (cartOverlay) cartOverlay.classList.toggle('active');
}

// Render Single Product Details
function renderProductDetails() {
    const productDetailsContainer = document.getElementById('product-details');
    if (!productDetailsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    if (!product) {
        productDetailsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 2rem;">Product not found.</p>';
        return;
    }

    productDetailsContainer.innerHTML = `
        <div class="product-viewer" style="display: flex; flex-wrap: wrap; gap: 3rem; align-items: center; justify-content: center; margin-top: 2rem;">
            <div class="product-viewer-img" style="flex: 1; min-width: 300px; max-width: 500px; background: var(--bg-card); padding: 2rem; border-radius: 15px; text-align: center;">
                <img src="img/${product.image}" alt="${product.name}" style="width: 100%; max-width: 400px; height: auto; object-fit: contain;">
            </div>
            <div class="product-viewer-info" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 1rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 0;">${product.name}</h1>
                <div style="font-size: 1.5rem; color: var(--accent-primary); font-weight: 600;">$${product.price.toFixed(2)}</div>
                <p style="color: var(--text-secondary); line-height: 1.6;">Premium quality supplement designed to help you reach your goals. Add this to your stack for maximum performance and recovery.</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})" style="padding: 1rem; font-size: 1.1rem; max-width: 250px; margin-top: 1rem; width: 100%;">Add to Cart</button>
            </div>
        </div>
    `;
}

// Event Listeners
if (cartBtn) cartBtn.addEventListener('click', toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
if (loginBtn) loginBtn.addEventListener('click', toggleAuthModal);

// Force reload on back navigation (bfcache)
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});

// Checkout Modals Elements
const checkoutModal = document.getElementById('checkout-modal');
const successModal = document.getElementById('success-modal');
const checkoutSummaryItems = document.getElementById('checkout-summary-items');
const checkoutTotalPrice = document.getElementById('checkout-total-price');

function toggleCheckoutModal() {
    if (checkoutModal) {
        checkoutModal.classList.toggle('active');
    }
}

function handleCheckout() {
    if (!currentUser) {
        // Close cart sidebar
        toggleCart();
        // Open auth modal
        toggleAuthModal();
        // Set error message
        if (authError) {
            authError.innerText = 'Please login to checkout.';
            authError.style.display = 'block';
        }
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    // Fill checkout summary
    if (checkoutSummaryItems) {
        checkoutSummaryItems.innerHTML = cart.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.95rem;">
                <span style="color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 250px;">${item.name}</span>
                <span style="color: var(--accent-primary); font-weight: 600;">$${item.price.toFixed(2)}</span>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if (checkoutTotalPrice) {
        checkoutTotalPrice.innerText = `$${total.toFixed(2)}`;
    }
    
    // Close cart sidebar and open checkout modal
    toggleCart();
    toggleCheckoutModal();
}

async function submitOrder() {
    const fullName = document.getElementById('checkout-fullname').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    const zipCode = document.getElementById('checkout-zip').value.trim();
    const city = document.getElementById('checkout-city').value.trim();
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // Group items to count quantities
    const groupedItems = {};
    cart.forEach(item => {
        if (!groupedItems[item.id]) {
            groupedItems[item.id] = { productId: item.id, price: item.price, quantity: 0 };
        }
        groupedItems[item.id].quantity += 1;
    });
    
    const items = Object.values(groupedItems);

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: currentUser,
                totalPrice: total,
                fullName,
                address,
                city,
                zipCode,
                paymentMethod,
                items
            })
        });

        if (response.ok) {
            // Order created successfully!
            // Clear local cart
            cart = [];
            localStorage.setItem(getLocalCartKey(), JSON.stringify(cart));
            updateCart();
            
            // Clear form
            const form = document.getElementById('checkout-form');
            if (form) form.reset();
            
            // Toggle checkout modal off and success modal on
            toggleCheckoutModal();
            if (successModal) successModal.classList.add('active');
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to place order.');
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        alert('Server error. Is the backend running?');
    }
}

function goToOrders() {
    if (successModal) successModal.classList.remove('active');
    window.location.href = 'orders.html';
}

// Render Orders History
async function renderOrdersHistory() {
    const container = document.getElementById('orders-main-content');
    if (!container) return;

    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 15px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h3 style="margin-bottom: 1rem; font-size: 1.5rem; color: var(--accent-primary);">Login Required</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">You need to be logged in to view your order history.</p>
                <button class="auth-btn" style="max-width: 200px; margin: 0 auto;" onclick="toggleAuthModal()">Login / Register</button>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders/${currentUser}`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        const orders = await response.json();
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: 15px; max-width: 500px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <h3 style="margin-bottom: 1rem; font-size: 1.5rem; color: var(--accent-primary);">No Orders Yet</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">You haven't placed any orders yet. Visit our shop to get started!</p>
                    <button class="auth-btn" style="max-width: 200px; margin: 0 auto;" onclick="window.location.href='shop.html'">Go to Shop</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="orders-list">
                ${orders.map(order => {
                    const dateFormatted = new Date(order.createdAt).toLocaleString();
                    const statusClass = order.status.toLowerCase() === 'pending' ? 'pending' : (order.status.toLowerCase() === 'completed' ? 'completed' : 'shipped');
                    const displayStatus = order.status === 'Pending' ? 'In progress' : order.status;

                    return `
                        <div class="order-card">
                            <div class="order-card-header">
                                <div>
                                    <div class="order-id">ORDER #ORD-${order.id}</div>
                                    <div class="order-date">${dateFormatted}</div>
                                </div>
                                <span class="status-badge ${statusClass}">${displayStatus}</span>
                            </div>
                            <div class="order-body">
                                <div class="order-items-list">
                                    ${order.items.map(item => {
                                        const product = products.find(p => p.id === item.productId) || { name: 'Unknown Product', image: 'protein.png' };
                                        return `
                                            <div class="order-item-row">
                                                <img src="img/${product.image}" alt="${product.name}">
                                                <div class="order-item-details">
                                                    <div class="order-item-name">${product.name}</div>
                                                    <div class="order-item-meta">Qty: ${item.quantity} | Price: $${Number(item.price).toFixed(2)}</div>
                                                </div>
                                                <div style="font-weight: 600; color: var(--text-primary);">$${(Number(item.price) * item.quantity).toFixed(2)}</div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="order-details-pane">
                                    <h4>Delivery & Payment</h4>
                                    <p><strong>Name:</strong> ${order.fullName}</p>
                                    <p><strong>Address:</strong> ${order.address}, ${order.zipCode} ${order.city}</p>
                                    <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                                    <div class="order-total-row">
                                        <span>Total Paid:</span>
                                        <span style="color: var(--accent-primary); font-weight: 800;">$${Number(order.totalPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 0; color: #ff3366;">
                <p>Failed to load orders. Please try again later.</p>
            </div>
        `;
    }
}

// Initialize
updateUserDisplay();
renderProducts();
renderProductDetails();
updateCart();
