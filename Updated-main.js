// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwqSchQXSj-9q3PCOY0o8vrq7tKMuCYAs",
  authDomain: "r-n-r-38dc8.firebaseapp.com",
  projectId: "r-n-r-38dc8",
  storageBucket: "r-n-r-38dc8.appspot.com",
  messagingSenderId: "425320845657",
  appId: "1:425320845657:web:8746d14fa263f924953c48",
  measurementId: "G-N42FBSYVHF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Global variables
let products = [];
let cart = [];
let currentUser = null;

// DOM elements
const productsContainer = document.getElementById("products");
const cartItemsContainer = document.getElementById("cartItems");
const cartCountElement = document.getElementById("cartCount");
const cartTotalElement = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");
const searchIcon = document.getElementById("searchIcon");
const categorySelect = document.getElementById("categorySelect");
const accountBtn = document.getElementById("accountBtn");
const accountModal = document.getElementById("accountModal");
const userEmailElement = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");
const closeAccountModal = document.getElementById("closeAccountModal");
const cartBtn = document.getElementById("cartBtn");
const cartSidebar = document.getElementById("cartSidebar");
const closeCartBtn = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const modalProductName = document.getElementById("modalProductName");
const modalProductDesc = document.getElementById("modalProductDesc");
const modalProductPrice = document.getElementById("modalProductPrice");

// Initialize the application
function init() {
  setupEventListeners();
  checkAuthState();
}

// Check authentication state
function checkAuthState() {
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      currentUser = user;
      userEmailElement.textContent = user.email;
      loadProducts();
    } else {
      // No user is signed in, redirect to auth page
      window.location.href = 'auth.html';
    }
  });
}

// Load products from Firestore
async function loadProducts() {
  try {
    const snapshot = await db.collection("shopItems").orderBy("name").get();
    products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    alert("Failed to load products. Please try again later.");
  }
}

// Render products based on filters
function renderProducts(filter = "", category = "all") {
  productsContainer.innerHTML = "";
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(filter.toLowerCase()) &&
    (category === "all" || product.category === category)
  );

  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = '<p class="no-products">No products found. Try a different search.</p>';
    return;
  }

  filteredProducts.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <img src="${product.imageUrl || 'https://via.placeholder.com/300'}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₹${product.price.toFixed(2)}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    productsContainer.appendChild(productCard);
  });
}

// Add product to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Check if product already exists in cart
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }
  
  updateCart();
  showCartNotification(product.name);
}

// Remove product from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// Update quantity of product in cart
function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  if (newQuantity < 1) {
    removeFromCart(cart.indexOf(item));
  } else {
    item.quantity = newQuantity;
  }
  
  updateCart();
}

// Update cart UI
function updateCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    checkoutBtn.disabled = true;
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>₹${item.price.toFixed(2)} × ${item.quantity}</p>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-controls">
            <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <button class="remove-btn" data-index="${index}">Remove</button>
        </div>
        <div class="cart-item-total">₹${itemTotal.toFixed(2)}</div>
      `;
      cartItemsContainer.appendChild(cartItem);
    });
    
    checkoutBtn.disabled = false;
  }

  cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartTotalElement.textContent = `₹${total.toFixed(2)}`;
}

// Show product details modal
function showProductModal(name, description, price) {
  modalProductName.textContent = name;
  modalProductDesc.textContent = description || "No description available.";
  modalProductPrice.textContent = `₹${price.toFixed(2)}`;
  productModal.style.display = "flex";
}

// Show notification when adding to cart
function showCartNotification(productName) {
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${productName} added to cart</span>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Process checkout
function processCheckout(name, email) {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  // In a real app, you would save the order to Firestore here
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Generate UPI payment link (example)
  const upiUrl = `upi://pay?pa=dinzd145@oksbi&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;
  
  // For demo purposes, we'll just show an alert
  alert(`Order placed successfully!\nTotal: ₹${total.toFixed(2)}\nRedirecting to payment...`);
  
  // Clear cart after checkout
  cart = [];
  updateCart();
  checkoutModal.style.display = "none";
  
  // In a real app, you would redirect to payment
  // window.location.href = upiUrl;
}

// Setup event listeners
function setupEventListeners() {
  // Account modal
  accountBtn.addEventListener("click", () => {
    accountModal.style.display = "flex";
  });
  
  closeAccountModal.addEventListener("click", () => {
    accountModal.style.display = "none";
  });
  
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "auth.html";
    });
  });

  // Cart sidebar
  cartBtn.addEventListener("click", () => {
    cartSidebar.classList.add("active");
  });
  
  closeCartBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
  });

  // Checkout modal
  checkoutBtn.addEventListener("click", () => {
    checkoutModal.style.display = "flex";
  });
  
  closeCheckoutModal.addEventListener("click", () => {
    checkoutModal.style.display = "none";
  });

  // Product modal
  closeProductModal.addEventListener("click", () => {
    productModal.style.display = "none";
  });

  // Checkout form
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    processCheckout(name, email);
  });

  // Search and filter
  searchIcon.addEventListener("click", () => {
    const filter = searchInput.value;
    const category = categorySelect.value;
    renderProducts(filter, category);
  });
  
  categorySelect.addEventListener("change", () => {
    const filter = searchInput.value;
    const category = categorySelect.value;
    renderProducts(filter, category);
  });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === accountModal) {
      accountModal.style.display = "none";
    }
    if (e.target === productModal) {
      productModal.style.display = "none";
    }
    if (e.target === checkoutModal) {
      checkoutModal.style.display = "none";
    }
  });

  // Delegate events for dynamically added elements
  document.addEventListener("click", (e) => {
    // Add to cart buttons
    if (e.target.classList.contains("add-to-cart")) {
      const productId = e.target.getAttribute("data-id");
      addToCart(productId);
    }
    
    // Quantity controls in cart
    if (e.target.classList.contains("quantity-btn")) {
      const action = e.target.getAttribute("data-action");
      const productId = e.target.getAttribute("data-id");
      const item = cart.find(item => item.id === productId);
      
      if (item) {
        const newQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
        updateQuantity(productId, newQuantity);
      }
    }
    
    // Remove buttons in cart
    if (e.target.classList.contains("remove-btn")) {
      const index = parseInt(e.target.getAttribute("data-index"));
      if (!isNaN(index)) {
        removeFromCart(index);
      }
    }
    
    // Product card clicks (for showing details)
    if (e.target.closest(".product-card") && !e.target.classList.contains("add-to-cart")) {
      const productCard = e.target.closest(".product-card");
      const productId = productCard.querySelector(".add-to-cart").getAttribute("data-id");
      const product = products.find(p => p.id === productId);
      if (product) {
        showProductModal(product.name, product.description, product.price);
      }
    }
  });
}

// Initialize the app
document.addEventListener("DOMContentLoaded", init);
