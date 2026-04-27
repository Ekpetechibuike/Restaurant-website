// Working hamburger menu + avatar only

// Profile menu - avatar only
function initProfileMenu() {
  const profileNavInfo = document.getElementById('profileNavInfo');
  const profileUsername = document.getElementById('profileUsername');
  const profileNavLink = document.getElementById('profileNavLink');
  const logoutNavBtn = document.getElementById('logoutNavBtn');
  const profileAvatarNav = document.getElementById('profileAvatarNav');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('authToken');
  
  if (token && user.username) {
    profileNavInfo.classList.remove('hidden');
    profileNavLink.classList.remove('hidden');
    logoutNavBtn.classList.remove('hidden');
    
    // **AVATAR ONLY** - hide all text
    profileUsername.style.display = 'none';
    
    if (profileAvatarNav) {
      profileAvatarNav.src = user.image || 'assets/images/default-avatar.jpg';
    }
  } else {
    profileNavInfo.classList.add('hidden');
    profileNavLink.classList.add('hidden');
    logoutNavBtn.classList.add('hidden');
  }
}

// Logout
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  initProfileMenu();

  // **HAMBURGER MENU** - main fix
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.getAttribute('data-open') === 'true';
      if (isOpen) {
        nav.style.display = 'none';
        nav.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      } else {
        nav.style.display = 'flex';
        nav.setAttribute('data-open', 'true');
        navToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on link click
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.style.display = 'none';
        nav.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Menu filtering
  const filters = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.card');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter.active')?.classList.remove('active');
      btn.classList.add('active');
      const group = btn.dataset.group;
      cards.forEach(card => {
        if (group === 'all' || card.dataset.group === group) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Reservation form
  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    function updateReservationFoods() {
      const checkboxes = document.querySelectorAll('input[name="res-foods"]:checked');
      const summary = document.getElementById('selectedFoodsCount');
      if (checkboxes.length === 0) {
        summary.textContent = '';
      } else {
        summary.textContent = `Selected: ${checkboxes.length} dish${checkboxes.length > 1 ? 'es' : ''}`;
      }
    }

    document.addEventListener('change', (e) => {
      if (e.target.name === 'res-foods') {
        updateReservationFoods();
      }
    });

    reservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('formStatus');
      const submitBtn = reservationForm.querySelector('button[type="submit"]');
      
      const foodsCheckboxes = document.querySelectorAll('input[name="res-foods"]:checked');
      const foods = Array.from(foodsCheckboxes).map(cb => ({
        name: cb.dataset.name || cb.value.split(' (')[0],
        price: parseInt(cb.dataset.price)
      }));
      
      const data = {
        name: reservationForm.name.value,
        email: reservationForm.email.value,
        date: reservationForm.date.value,
        time: reservationForm.time.value,
        guests: reservationForm.guests.value,
        message: reservationForm.message.value,
        foods
      };
      
      submitBtn.disabled = true;
      statusEl.textContent = 'Sending...';
      
      try {
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
        });
        if (response.ok) {
          statusEl.textContent = '✓ Reservation confirmed!';
          statusEl.style.color = 'green';
          setTimeout(() => location.reload(), 2000);
        } else {
          const payload = await response.json();
          statusEl.textContent = payload.error || 'Failed';
          statusEl.style.color = 'red';
        }
      } catch (err) {
        statusEl.textContent = 'Network error';
        statusEl.style.color = 'red';
      }
      
      submitBtn.disabled = false;
    });
  }

  // Order modal functions
  let currentOrderDish = '';
  let currentOrderPrice = 0;

  window.openOrderModal = (dish, price) => {
    currentOrderDish = dish;
    currentOrderPrice = price;
    document.getElementById('orderDish').textContent = dish;
    document.getElementById('orderPrice').textContent = `₦${price}`;
    document.getElementById('orderQuantity').value = 1;
    document.getElementById('orderTotal').value = price;
    document.getElementById('orderModal').classList.remove('hidden');
  };

  window.closeOrderModal = () => {
    document.getElementById('orderModal').classList.add('hidden');
  };

  window.updateOrderTotal = () => {
    const qty = parseInt(document.getElementById('orderQuantity').value) || 1;
    document.getElementById('orderTotal').value = currentOrderPrice * qty;
  };

  // Order form
  document.getElementById('orderForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById('orderStatus');
    
    const data = {
      name: document.getElementById('orderName').value,
      phone: document.getElementById('orderPhone').value,
      dish: currentOrderDish,
      quantity: parseInt(document.getElementById('orderQuantity').value),
      address: document.getElementById('orderAddress').value,
      total: parseFloat(document.getElementById('orderTotal').value)
    };
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        statusEl.textContent = '✓ Order placed!';
        statusEl.style.color = 'green';
        setTimeout(() => closeOrderModal(), 2000);
      } else {
        const error = await response.json();
        statusEl.textContent = error.error || 'Failed';
        statusEl.style.color = 'red';
      }
    } catch (err) {
      statusEl.textContent = 'Network error';
      statusEl.style.color = 'red';
    }
  });
});

