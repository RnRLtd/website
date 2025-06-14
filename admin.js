// Admin Panel Logic
document.addEventListener('DOMContentLoaded', () => {
    // Load products from backend (in real app)
    loadAdminProducts();
    
    // Open Add Product Modal
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('productModal').style.display = 'flex';
    });
    
    // Close Modal
    document.addEventListener('click', (e) => {
        if (e.target === document.getElementById('productModal')) {
            document.getElementById('productModal').style.display = 'none';
        }
    });
    
    // Save Product
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const image = document.getElementById('productImage').value;
        
        // In real app, send to backend
        alert(`Product "${name}" added successfully!`);
        document.getElementById('productModal').style.display = 'none';
        document.getElementById('productForm').reset();
    });
});

function loadAdminProducts() {
    // In real app, fetch from backend
    const products = [
        { id: 1, name: "Coca-Cola", price: 1.50 },
        { id: 2, name: "Lays Chips", price: 2.00 },
    ];
    
    const tableBody = document.getElementById('adminProducts');
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <button class="btn-edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}