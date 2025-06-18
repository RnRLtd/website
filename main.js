const products = [
  { id: 1, name: 'Apple', price: 30, image: 'https://via.placeholder.com/200x150?text=Apple' },
  { id: 2, name: 'Banana', price: 20, image: 'https://via.placeholder.com/200x150?text=Banana' },
  { id: 3, name: 'Milk', price: 50, image: 'https://via.placeholder.com/200x150?text=Milk' },
];

let cart = [];

function renderProducts(filter = '') {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products
    .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image}" class="product-img" />
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
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cartCount').innerText = cart.length;
  const itemsContainer = document.getElementById('cartItems');
  itemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `
      <p>${item.name} - ₹${item.price}
        <button onclick="removeFromCart(${index})" style="margin-left:10px;color:red;">Remove</button>
      </p>
    `;
    itemsContainer.appendChild(itemDiv);
  });

  document.getElementById('cartTotal').innerText = `₹${total.toFixed(2)}`;
}

document.getElementById('cartBtn').onclick = () => {
  document.getElementById('cartSidebar').classList.add('active');
};

document.getElementById('closeCart').onclick = () => {
  document.getElementById('cartSidebar').classList.remove('active');
};

document.getElementById('checkoutBtn').onclick = () => {
  document.getElementById('checkoutModal').classList.add('show');
};

document.getElementById('checkoutForm').onsubmit = (e) => {
  e.preventDefault();
  const total = getTotal();
  const upiId = `upi://pay?pa=yourupi@bank&pn=QuickShop&am=${total}&cu=INR`;
  document.getElementById('upiLink').href = upiId;
  alert('Click "Pay via UPI" to complete your payment.');
};

function getTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

document.getElementById('searchBtn').onclick = () => {
  const query = document.getElementById('searchInput').value;
  renderProducts(query);
};

// Initial render
renderProducts();
