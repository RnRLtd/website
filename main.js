// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAwqSchQXSj-9q3PCOY0o8vrq7tKMuCYAs",
  authDomain: "r-n-r-38dc8.firebaseapp.com",
  projectId: "r-n-r-38dc8",
  storageBucket: "r-n-r-38dc8.appspot.com",
  messagingSenderId: "425320845657",
  appId: "1:425320845657:web:8746d14fa263f924953c48",
  measurementId: "G-N42FBSYVHF"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let products = [];
let cart = [];

async function loadProducts() {
  const snapshot = await db.collection("shopItems").orderBy("name").get();
  products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("products");
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const selectedCategory = document.getElementById("categorySelect").value;

  container.innerHTML = "";

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchValue);
    const matchesCategory =
  selectedCategory === "all" ||
  (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <button class="add-to-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (product) {
    cart.push(product);
    updateCart();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += parseFloat(item.price);
    const div = document.createElement("div");
    div.innerHTML = `
      ${item.name} - ₹${item.price}
      <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItems.appendChild(div);
  });

  cartCount.textContent = cart.length;
  cartTotal.textContent = `₹${total.toFixed(2)}`;
}

document.getElementById("cartBtn").onclick = () => {
  document.getElementById("cartSidebar").classList.add("active");
};

document.getElementById("closeCart").onclick = () => {
  document.getElementById("cartSidebar").classList.remove("active");
};

document.getElementById("checkoutBtn").onclick = () => {
  document.getElementById("checkoutModal").style.display = "flex";
};

document.getElementById("checkoutForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
  const name = document.getElementById("userName").value.trim();
  if (total === 0) {
    alert("Your cart is empty!");
    return;
  }
  const upiUrl = `upi://pay?pa=dinzd145@oksbi&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;
  window.location.href = upiUrl;
});

document.getElementById("searchIcon").onclick = renderProducts;
document.getElementById("categorySelect").onchange = renderProducts;

window.onload = loadProducts;
