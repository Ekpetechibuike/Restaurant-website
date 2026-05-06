/**
 * Restaurant Website - STATIC-ONLY VERSION
 * Netlify/GitHub Pages 100% - NO server popup EVER
 */

// ========== AUTH & PROFILE FUNCTIONS ==========
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user && user.id) {
    updateProfileNav(user);
  }
}

function updateProfileNav(user) {
  const profileNavInfo = document.getElementById('profileNavInfo');
  const profileNavLink = document.getElementById('profileNavLink');
  const logoutNavBtn = document.getElementById('logoutNavBtn');
  const profileNav = document.getElementById('nav');
  
  if (profileNavInfo && profileNavLink && logoutNavBtn) {
    profileNavInfo.classList.remove('hidden');
    profileNavLink.classList.remove('hidden');
    logoutNavBtn.classList.remove('hidden');
    
    const profileUsername = document.getElementById('profileUsername');
    const profileAvatarNav = document.getElementById('profileAvatarNav');
    
    if (profileUsername) {
      profileUsername.textContent = user.username || user.name || 'User';
    }
    if (profileAvatarNav) {
      profileAvatarNav.src = user.image || 'assets/images/default-avatar.jpg';
    }
  }
}

// Logout function - delegates to window.auth.logout() in auth.js for consistency
function logout() {
  if (window.auth && typeof window.auth.logout === 'function') {
    window.auth.logout();
  } else {
    // Fallback if auth.js not loaded
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Hide profile elements
    const profileNavInfo = document.getElementById('profileNavInfo');
    const profileNavLink = document.getElementById('profileNavLink');
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    
    if (profileNavInfo) profileNavInfo.classList.add('hidden');
    if (profileNavLink) profileNavLink.classList.add('hidden');
    if (logoutNavBtn) logoutNavBtn.classList.add('hidden');
    
    // Redirect to home
    window.location.href = 'index.html';
  }
}

// ========== MENU FILTER FUNCTIONALITY ==========
function initMenuFilters() {
  const filterBtns = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.card');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const group = btn.dataset.group;
      
      // Filter cards
      cards.forEach(card => {
        if (group === 'all' || card.dataset.group === group) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ========== RESERVATION FORM HANDLING ==========
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const statusEl = document.getElementById('formStatus');
    
    // Get selected foods
    const selectedFoods = [];
    const foodCheckboxes = form.querySelectorAll('input[name="res-foods"]:checked');
    foodCheckboxes.forEach(cb => {
      selectedFoods.push({
        name: cb.value,
        price: parseInt(cb.dataset.price)
      });
    });
    
    const reservation = {
      id: Date.now(),
      name: formData.get('name'),
      email: formData.get('email'),
      date: formData.get('date'),
      time: formData.get('time'),
      guests: parseInt(formData.get('guests')),
      message: formData.get('message'),
      foods: selectedFoods,
      total: selectedFoods.reduce((sum, f) => sum + f.price, 0),
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // Save to local JSON file for static display
    try {
      localStorage.setItem('reservationPending', JSON.stringify(reservation));
    } catch (err) {
      console.log('LocalStorage save:', err);
    }
    
    if (statusEl) {
      statusEl.textContent = 'Reservation submitted successfully!';
      statusEl.style.color = 'green';
    }
    
    form.reset();
    
    setTimeout(() => {
      if (statusEl) statusEl.textContent = '';
    }, 5000);
  });
}

// ========== ORDER MODAL FUNCTIONS ==========
let currentDish = '';
let currentPrice = 0;

function openOrderModal(dish, price) {
  const modal = document.getElementById('orderModal');
  if (!modal) return;
  
  currentDish = dish;
  currentPrice = price;
  
  const dishEl = document.getElementById('orderDish');
  const priceEl = document.getElementById('orderPrice');
  const totalEl = document.getElementById('orderTotal');
  
  if (dishEl) dishEl.textContent = dish;
  if (priceEl) priceEl.textContent = '₦' + price.toLocaleString();
  if (totalEl) totalEl.value = price;
  
  modal.classList.remove('hidden');
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.classList.add('hidden');
}

function updateOrderTotal() {
  const quantityEl = document.getElementById('orderQuantity');
  const totalEl = document.getElementById('orderTotal');
  
  if (quantityEl && totalEl) {
    const quantity = parseInt(quantityEl.value) || 1;
    totalEl.value = quantity * currentPrice;
  }
}

function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const statusEl = document.getElementById('orderStatus');
    
    const order = {
      id: Date.now(),
      name: formData.get('orderName'),
      phone: formData.get('orderPhone'),
      dish: currentDish,
      quantity: parseInt(formData.get('orderQuantity')),
      address: formData.get('orderAddress'),
      total: parseInt(formData.get('orderTotal')),
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    if (statusEl) {
      statusEl.textContent = 'Order placed successfully!';
      statusEl.style.color = 'green';
    }
    
    setTimeout(() => {
      closeOrderModal();
      if (statusEl) statusEl.textContent = '';
      form.reset();
    }, 2000);
  });
}

// ========== NAVIGATION TOGGLE ==========
function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.dataset.open === 'true';
      nav.dataset.open = !isOpen;
      navToggle.setAttribute('aria-expanded', !isOpen);
    });
  }
}

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('Nigeria Flavors - Static ready!');
  
  // Initialize all components
  checkAuth();
  initMenuFilters();
  initReservationForm();
  initOrderForm();
  initNavToggle();
  
  // Demo user auto-login (for development)
  const demoUser = {
    id: 1,
    username: 'chibuike',
    name: 'EKPETE Chibuike',
    email: 'Ekpetechibuike@icloud.com',
    image: 'assets/images/default-avatar.jpg'
  };
  
  // Auto-login for demo purposes (optional - remove in production)
  // localStorage.setItem('user', JSON.stringify(demoUser));
  // localStorage.setItem('authToken', 'demo-token');
  // updateProfileNav(demoUser);
});
