Update Firebase realtime database rules to include user profile
json:
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    // ... keep your existing product and order rules
  }
}

javascript (profile functionality):
// Firebase References
const usersRef = database.ref('users');

// Profile Functions
function showProfileSection() {
    document.getElementById('profile-section').classList.remove('hidden');
    // Hide other sections if needed
    document.getElementById('customer-view').classList.add('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
    
    // Load user data
    loadUserProfile();
}

function loadUserProfile() {
    const user = auth.currentUser;
    if (user) {
        // Set the email (can't be changed)
        document.getElementById('profile-email').value = user.email || '';
        
        // Load user profile data
        usersRef.child(user.uid).once('value').then(snapshot => {
            const userData = snapshot.val() || {};
            document.getElementById('profile-name').value = userData.name || '';
            document.getElementById('profile-phone').value = userData.phone || '';
            document.getElementById('profile-address').value = userData.address || '';
        });
    }
}

function saveProfile() {
    const user = auth.currentUser;
    if (!user) return;
    
    const profileData = {
        name: document.getElementById('profile-name').value,
        phone: document.getElementById('profile-phone').value,
        address: document.getElementById('profile-address').value,
        email: user.email, // Store for reference (can't be changed)
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Save to Firebase
    usersRef.child(user.uid).set(profileData)
        .then(() => {
            alert('Profile updated successfully!');
        })
        .catch(error => {
            console.error('Error saving profile:', error);
            alert('Error saving profile: ' + error.message);
        });
}

// Initialize profile functionality
function initProfile() {
    // Profile button click handler
    document.getElementById('profile-btn').addEventListener('click', showProfileSection);
    
    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    // Add a back button handler if needed
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('back-to-shop')) {
            document.getElementById('profile-section').classList.add('hidden');
            document.getElementById('customer-view').classList.remove('hidden');
        }
    });
}

// Update your init function to include profile
function init() {
    checkAdminStatus();
    loadProducts();
    setupEventListeners();
    initProfile(); // Add this line
}


javascript(Enhance the Order System with User Profiles):
function processOrder(name, phone) {
    const user = auth.currentUser;
    let userId = null;
    let userProfileData = null;
    
    if (user) {
        userId = user.uid;
        // Get the latest profile data
        userProfileData = {
            name: document.getElementById('profile-name').value || name,
            phone: document.getElementById('profile-phone').value || phone,
            address: document.getElementById('profile-address').value || ''
        };
        
        // Update profile with the latest order info if empty
        if (!userProfileData.name) userProfileData.name = name;
        if (!userProfileData.phone) userProfileData.phone = phone;
        
        // Save/update profile
        usersRef.child(userId).update(userProfileData);
    }
    
    // Rest of your order processing code...
    const orderData = {
        customer: {
            name: userProfileData?.name || name,
            phone: userProfileData?.phone || phone,
            address: userProfileData?.address || '',
            userId: userId || null
        },
        // ... rest of order data
    };
    
    // Continue with order processing...
}


javascript (Add Profile Link to Receipt):
function generateReceipt() {
    if (!currentOrder) return;
    
    let receipt = `
        <div class="text-center mb-4">
            <h2 class="text-xl font-bold">QuickStop Convenience Store</h2>
            <p>123 Main Street, Neighborhood</p>
            <p>Tel: (555) 123-4567</p>
        </div>
        <div class="mb-4">
            <p>Order #${currentOrder.id}</p>
            <p>Date: ${new Date(currentOrder.date).toLocaleString()}</p>
            <p>Customer: ${currentOrder.customer.name}</p>
            ${currentOrder.customer.address ? `<p>Address: ${currentOrder.customer.address}</p>` : ''}
            <p>Phone: ${currentOrder.customer.phone}</p>
        </div>
        <!-- Rest of your receipt HTML -->
    `;
    
    receiptContent.innerHTML = receipt;
    receiptModal.classList.remove('hidden');
}


Add User Registration (Optional):
<!-- Add this modal to your HTML -->
<div id="register-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Create Account</h3>
        <form id="register-form">
            <div class="mb-4">
                <label class="block text-gray-700 mb-2" for="register-email">Email</label>
                <input type="email" id="register-email" class="w-full px-3 py-2 border rounded" required>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 mb-2" for="register-password">Password</label>
                <input type="password" id="register-password" class="w-full px-3 py-2 border rounded" required>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 mb-2" for="register-name">Full Name</label>
                <input type="text" id="register-name" class="w-full px-3 py-2 border rounded" required>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                Register
            </button>
        </form>
    </div>
</div>

javascript:
// Registration function
function registerUser(email, password, name) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Save additional user data
            return usersRef.child(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .then(() => {
            alert('Account created successfully!');
            document.getElementById('register-modal').classList.add('hidden');
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        });
}


Add Login/Logout Functionality:
// Add registration form handler
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    registerUser(email, password, name);
});

<div id="auth-buttons" class="flex items-center space-x-4">
    <button id="login-btn" class="text-gray-700 hover:text-blue-600">
        <i class="fas fa-sign-in-alt text-xl"></i>
    </button>
    <button id="logout-btn" class="text-gray-700 hover:text-blue-600 hidden">
        <i class="fas fa-sign-out-alt text-xl"></i>
    </button>
</div>


javascript:
// Auth state handler
function updateAuthUI(user) {
    if (user) {
        // User is signed in
        document.getElementById('login-btn').classList.add('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        document.getElementById('profile-btn').classList.remove('hidden');
    } else {
        // User is signed out
        document.getElementById('login-btn').classList.remove('hidden');
        document.getElementById('logout-btn').classList.add('hidden');
        document.getElementById('profile-btn').classList.add('hidden');
    }
}

// Login function
function loginUser(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert('Logged in successfully!');
            document.getElementById('login-modal').classList.add('hidden');
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        });
}

// Logout function
function logoutUser() {
    auth.signOut()
        .then(() => {
            alert('Logged out successfully!');
        })
        .catch(error => {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        });
}

// Add auth state listener
auth.onAuthStateChanged(user => {
    updateAuthUI(user);
    checkAdminStatus(user); // Update your existing admin check function
});

// Add login/logout handlers
document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('login-modal').classList.remove('hidden');
});

document.getElementById('logout-btn').addEventListener('click', logoutUser);
