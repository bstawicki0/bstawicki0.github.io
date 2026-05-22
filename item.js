// item.js

const products = [
    {
        id: 1,
        name: 'ISO-GLOW WHEY PROTEIN',
        price: 49.99,
        image: 'protein.png',
        description: 'Ultra-premium whey isolate engineered for lean muscle growth, rapid recovery and maximum absorption.',
        ingredients: [
            'Whey Protein Isolate',
            'Digestive Enzymes',
            'Natural Flavors',
            'Cocoa Powder',
            'Stevia Extract'
        ],
        benefits: [
            '25g Protein Per Serving',
            'Fast Muscle Recovery',
            'Low Sugar Formula',
            'Supports Lean Muscle Growth'
        ]
    },

    {
        id: 2,
        name: 'CREATINE MONOHYDRATE',
        price: 24.99,
        image: 'creatine.png',
        description: 'Micronized creatine formula designed to improve strength, endurance and explosive power.',
        ingredients: [
            'Creatine Monohydrate'
        ],
        benefits: [
            'Increased Strength',
            'Explosive Performance',
            'Better Recovery',
            '5g Creatine Per Serving'
        ]
    },

    {
        id: 3,
        name: 'HYPERVOLT ELITE PRE-WORKOUT',
        price: 39.99,
        image: 'preworkout.png',
        description: 'Advanced stimulant pre-workout for insane pumps, laser focus and unstoppable energy.',
        ingredients: [
            'Caffeine',
            'Beta-Alanine',
            'L-Citrulline',
            'Taurine',
            'Tyrosine'
        ],
        benefits: [
            'Extreme Energy',
            'Muscle Pump',
            'Focus Enhancement',
            'Improved Endurance'
        ]
    }
];

// GET PRODUCT ID FROM URL
const params = new URLSearchParams(window.location.search);
const productId = Number(params.get('id'));

const product = products.find(p => p.id === productId);

// DOM
const productImage = document.getElementById('product-image');
const productName = document.getElementById('product-name');
const productPrice = document.getElementById('product-price');
const productDescription = document.getElementById('product-description');
const ingredientsList = document.getElementById('ingredients-list');
const benefitsList = document.getElementById('benefits-list');
const addToCartBtn = document.getElementById('add-to-cart-btn');

if (product) {

    productImage.src = `img/${product.image}`;
    productImage.alt = product.name;

    productName.innerText = product.name;

    productPrice.innerText = `$${product.price.toFixed(2)}`;

    productDescription.innerText = product.description;

    ingredientsList.innerHTML = product.ingredients
        .map(item => `<li>${item}</li>`)
        .join('');

    benefitsList.innerHTML = product.benefits
        .map(item => `
            <div class="benefit-item">
                ✓ ${item}
            </div>
        `)
        .join('');

} else {

    document.querySelector('.product-view-container').innerHTML = `
        <h1 style="text-align:center;">Product not found.</h1>
    `;
}

// ADD TO CART
addToCartBtn.addEventListener('click', () => {

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart.push(product);

    localStorage.setItem('cart', JSON.stringify(cart));

    addToCartBtn.innerText = 'Added!';
});
