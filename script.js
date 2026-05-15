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
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userDisplay) {
            userDisplay.style.display = 'block';
            userDisplay.innerHTML = `${currentUser} <span style="font-size: 0.8rem; margin-left: 0.5rem; cursor: pointer; color: var(--text-secondary);" onclick="logoutUser()">[Logout]</span>`;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userDisplay) userDisplay.style.display = 'none';
    }
}

// Render Products
function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="img/${product.image}" alt="${product.name}" class="product-img">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
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

// Event Listeners
if (cartBtn) cartBtn.addEventListener('click', toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);
if (loginBtn) loginBtn.addEventListener('click', toggleAuthModal);

// Initialize
updateUserDisplay();
renderProducts();
updateCart();
