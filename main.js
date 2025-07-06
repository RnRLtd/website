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

// DOM elements (add profile-related elements)
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

// Profile-related DOM elements (only available on profile.html)
const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const changePasswordLink = document.getElementById("changePasswordLink");
const passwordModal = document.getElementById("passwordModal");
const closePasswordModal = document.getElementById("closePasswordModal");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const passwordError = document.getElementById("passwordError");
const passwordSuccess = document.getElementById("passwordSuccess");

// Initialize the application
function init() {
  setupEventListeners();
  checkAuthState();
  
  // Initialize profile page if we're on profile.html
  if (window.location.pathname.includes('profile.html')) {
    initializeProfilePage();
  }
}

function checkAuthState() {
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      if (userEmailElement) userEmailElement.textContent = user.email;
      if (logoutBtn) logoutBtn.style.display = "block";
      
      // Load user data if on profile page
      if (window.location.pathname.includes('profile.html')) {
        loadUserData(user);
      }
    } else {
      currentUser = null;
      if (userEmailElement) userEmailElement.textContent = "Guest user";
      if (logoutBtn) logoutBtn.style.display = "none";
      
      // Redirect to auth if on profile page
      if (window.location.pathname.includes('profile.html')) {
        window.location.href = 'auth.html';
      }
    }
    
    if (!window.location.pathname.includes('profile.html')) {
      loadProducts();
    }
  });
}

// Profile Page Functions
function initializeProfilePage() {
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProfileData();
    });
  }
  
  if (changePasswordLink) {
    changePasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (passwordModal) passwordModal.style.display = 'flex';
    });
  }
  
  if (closePasswordModal) {
    closePasswordModal.addEventListener('click', () => {
      if (passwordModal) passwordModal.style.display = 'none';
    });
  }
  
  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      changePassword();
    });
  }
}

function loadUserData(user) {
  db.collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        // Fill form with user data
        document.getElementById('firstName').value = userData.firstName || '';
        document.getElementById('lastName').value = userData.lastName || '';
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = userData.phone || '';
        document.getElementById('address').value = userData.address || '';
        document.getElementById('city').value = userData.city || '';
        document.getElementById('state').value = userData.state || '';
        document.getElementById('zipCode').value = userData.zipCode || '';
        
        if (userData.photoURL && document.getElementById('profilePicture')) {
          document.getElementById('profilePicture').src = userData.photoURL;
        }
      } else {
        // Create empty user document if it doesn't exist
        db.collection('users').doc(user.uid).set({
          firstName: '',
          lastName: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    })
    .catch(error => {
      console.error('Error loading user data:', error);
      showMessage('Error loading profile data', 'error');
    });
}

function saveProfileData() {
  if (!currentUser || !profileForm) return;

  const formData = {
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    zipCode: document.getElementById('zipCode').value.trim()
  };

  // Validate form
  if (!formData.firstName || !formData.lastName || !formData.email) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }

  // Update email if changed
  const updates = [];
  if (formData.email !== currentUser.email) {
    updates.push(currentUser.updateEmail(formData.email));
  }

  // Update Firestore
  updates.push(
    db.collection('users').doc(currentUser.uid).set({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
  );

  Promise.all(updates)
    .then(() => showMessage('Profile updated successfully!', 'success'))
    .catch(error => showMessage('Error updating profile: ' + error.message, 'error'));
}

function changePassword() {
  if (!currentUser || !passwordForm) return;

  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords
  if (newPassword !== confirmPassword) {
    showMessage('New passwords do not match', 'error', true);
    return;
  }

  if (newPassword.length < 6) {
    showMessage('Password must be at least 6 characters', 'error', true);
    return;
  }

  // Reauthenticate and change password
  const credential = firebase.auth.EmailAuthProvider.credential(
    currentUser.email, 
    currentPassword
  );

  currentUser.reauthenticateWithCredential(credential)
    .then(() => currentUser.updatePassword(newPassword))
    .then(() => {
      showMessage('Password changed successfully!', 'success', true);
      passwordForm.reset();
      setTimeout(() => {
        if (passwordModal) passwordModal.style.display = 'none';
      }, 2000);
    })
    .catch(error => showMessage('Error changing password: ' + error.message, 'error', true));
}

// Shared utility functions
function showMessage(message, type, isPassword = false) {
  let element;
  if (isPassword) {
    element = type === 'success' ? passwordSuccess : passwordError;
  } else {
    element = type === 'success' ? successMessage : errorMessage;
  }

  if (element) {
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => element.style.display = 'none', 3000);
  } else {
    alert(message); // Fallback if message elements don't exist
  }
}

// Rest of your existing functions (loadProducts, renderProducts, etc.)
// ... [Keep all your existing product and cart functions unchanged] ...

// Initialize the app
window.addEventListener("DOMContentLoaded", init);

// Expose functions to global scope
window.addToCart = addToCart;
window.showProductModal = showProductModal;
window.removeFromCart = removeFromCart;
