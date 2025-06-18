const products = [
  { id: 1, name: "Milk", price: 30, img: "https://via.placeholder.com/150?text=Milk" },
  { id: 2, name: "Bread", price: 25, img: "https://via.placeholder.com/150?text=Bread" },
  { id: 3, name: "Butter", price: 50, img: "https://via.placeholder.com/150?text=Butter" },
  { id: 4, name: "Juice", price: 40, img: "https://via.placeholder.com/150?text=Juice" }
];

let cart = [];

function renderProducts(filter = "") {
  const container = document.getElementById("products");
  container.innerHTML = "";

  const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  filtered.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" class="product-img" />
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  cart.push(product);
  updateCart();
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
    total += item.price;
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
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const name = document.getElementById("userName").value.trim();
  if (total === 0) {
    alert("Your cart is empty!");
    return;
  }
  const upiUrl = `upi://pay?pa=dinzd145@oksbi&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;
  window.location.href = upiUrl;
});

document.getElementById("searchIcon").onclick = () => {
  const filter = document.getElementById("searchInput").value;
  renderProducts(filter);
};

renderProducts();
