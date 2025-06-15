// Sample Products Data
const products = [
  { id: 1, name: "Coca-Cola", price: 1.50, image: "coke.jpg" },
  { id: 2, name: "Lays Chips", price: 2.00, image: "chips.jpg" },
  { id: 3, name: "Milk", price: 3.50, image: "milk.jpg" },
];

let cart = [];

// Load Products
function loadProducts() {
  const productsGrid = document.getElementById('products');
  productsGrid.innerHTML = '';

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <img src="images/${product.image}" alt="${product.name}" class="product-img">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>₹${product.price.toFixed(2)}</p>
        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });
}

// Add to Cart
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    const productId = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === productId);

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCart();
  }
});

// Update Cart UI
function updateCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');

  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div>
        <h4>${item.name}</h4>
        <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
      </div>
      <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
    `;
    cartItems.appendChild(cartItem);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `₹${total.toFixed(2)}`;
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Toggle Cart Sidebar
document.getElementById('cartBtn').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.add('active');
});

document.getElementById('closeCart').addEventListener('click', () => {
  document.getElementById('cartSidebar').classList.remove('active');
});

// Remove Item
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
    const productId = parseInt(e.target.dataset.id || e.target.closest('.remove-item').dataset.id);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
  }
});

// Show Checkout Modal
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return alert('Your cart is empty!');
  document.getElementById('checkoutModal').style.display = 'flex';
});

// Close Modal
document.addEventListener('click', (e) => {
  if (e.target === document.getElementById('checkoutModal')) {
    document.getElementById('checkoutModal').style.display = 'none';
  }
});

// Submit Checkout Form and Redirect to UPI
document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  if (!name || !email) return alert("Please fill in all fields.");

  if (cart.length === 0) return alert('Cart is empty');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  // ✅ UPI Redirect
  const upiID = "dinzd145@oksbi"; // Change this to your actual UPI ID
  const upiURI = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${total}&cu=INR`;

  if (confirm(`Pay ₹${total} using UPI app?`)) {
    window.location.href = upiURI;
  }

  generateReceipt();
  cart = [];
  updateCart();
  document.getElementById('checkoutModal').style.display = 'none';
});

// Generate Receipt (Log only)
function generateReceipt() {
  let receipt = `=== QuickShop Receipt ===\n`;
  receipt += `Date: ${new Date().toLocaleString()}\n\n`;

  cart.forEach(item => {
    receipt += `${item.name} - ₹${item.price.toFixed(2)} x ${item.quantity}\n`;
  });

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  receipt += `\nTotal: ₹${total.toFixed(2)}\n`;
  receipt += `Thank you for shopping with us!\n`;

  console.log(receipt); // Could be sent to email or saved
}

// Init
loadProducts();
