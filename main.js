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

function checkAuthState() {
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      userEmailElement.textContent = user.email;
      logoutBtn.style.display = "block";
    } else {
      currentUser = null;
      userEmailElement.textContent = "Guest user";
      logoutBtn.style.display = "none";
    }
    loadProducts();
  });
}

async function loadProducts() {
  try {
    const snapshot = await db.collection("shopItems").orderBy("name").get();
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

function renderProducts(filter = "", category = "all") {
  productsContainer.innerHTML = "";
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) &&
    (category === "all" || p.category === category)
  );

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    updateCart();
  }
}

function showProductModal(name, description, price = 0) {
  modalProductName.textContent = name;
  modalProductDesc.textContent = description || "No description available.";
  modalProductPrice.textContent = `₹${price}`;
  productModal.style.display = "flex";
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += parseFloat(item.price);
    const div = document.createElement("div");
    div.innerHTML = `
      ${item.name} - ₹${item.price}
      <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItemsContainer.appendChild(div);
  });
  cartCountElement.textContent = cart.length;
  cartTotalElement.textContent = `₹${total.toFixed(2)}`;
}

function setupEventListeners() {
  accountBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = "auth.html";
    } else {
      window.location.href = "user.html";
    }
  });

  closeAccountModal.addEventListener("click", () => {
    accountModal.style.display = "none";
  });

  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      accountModal.style.display = "none";
      window.location.href = "auth.html";
    });
  });

  
  

  cartBtn.addEventListener("click", () => {
    cartSidebar.classList.add("active");
  });

  closeCartBtn.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
  });

  checkoutBtn.addEventListener("click", () => {
    checkoutModal.style.display = "flex";
  });

  closeCheckoutModal.addEventListener("click", () => {
    checkoutModal.style.display = "none";
  });

  closeProductModal.addEventListener("click", () => {
    productModal.style.display = "none";
  });

  checkoutForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmailInput").value.trim();

    if (total === 0) {
      alert("Your cart is empty!");
      return;
    }

    const upiUrl = `upi://pay?pa=dinzd145@oksbi&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;
    window.location.href = upiUrl;

    cart = [];
    updateCart();
    checkoutModal.style.display = "none";
  });

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

  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      event.target.style.display = "none";
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const productId = e.target.getAttribute("data-id");
      addToCart(productId);
    }

    if (e.target.closest(".product-card") && !e.target.classList.contains("add-to-cart")) {
      const card = e.target.closest(".product-card");
      const productId = card.querySelector(".add-to-cart").getAttribute("data-id");
      const product = products.find(p => p.id === productId);
      if (product) {
        showProductModal(product.name, product.description, product.price);
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", init);

// Expose functions to global scope
window.addToCart = addToCart;
window.showProductModal = showProductModal;
window.removeFromCart = removeFromCart;
