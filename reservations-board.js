// ========== LOGIN FUNCTIONALITY ==========
function checkLogin() {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const loginModal = document.getElementById('loginModal');
  
  if (!isLoggedIn && loginModal) {
    loginModal.classList.remove('hidden');
  } else if (isLoggedIn && loginModal) {
    loginModal.classList.add('hidden');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Simple demo credentials check
  if (username === 'admin' && password === 'password') {
    sessionStorage.setItem('isLoggedIn', 'true');
    const loginModal = document.getElementById('loginModal');
    if(loginModal) {
      loginModal.classList.add('hidden');
    }
    // Clear form
    document.getElementById('loginForm').reset();
  } else {
    alert('Invalid username or password. Use admin/password');
  }
}

// ========== RESERVATIONS BOARD FUNCTIONALITY ==========

const reservationsBoard = document.getElementById('reservationsBoard');
const lastUpdateEl = document.getElementById('lastUpdate');
let allReservations = [];


// Format date and time
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(timeString) {
  return timeString;
}

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString();
}

// Fetch reservations from server
async function fetchData() {
  try {
    // Fetch reservations and orders
    const [resResponse, orderResponse] = await Promise.all([
      fetch('/api/reservations'),
      fetch('/api/orders')
    ]);
    
    let reservations = [];
    let orders = [];
    
    if (resResponse.ok) {
      reservations = await resResponse.json();
    }
    if (orderResponse.ok) {
      orders = await orderResponse.json();
    }
    
    allReservations = Array.isArray(reservations) ? reservations : reservations.reservations || [];
    allReservations = allReservations.concat(orders.map(order => ({
      ...order,
      type: 'Order',
      guests: order.quantity,
      date: order.createdAt.split('T')[0],
      time: 'Delivery',
      message: `Order: ${order.dish} x${order.quantity}`
    })));
    
    renderReservations();
    lastUpdateEl.textContent = formatTimestamp(new Date().toISOString());
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Render reservations to the board
function renderReservations() {
  reservationsBoard.innerHTML = '';

  if (allReservations.length === 0) {
    reservationsBoard.innerHTML = `
      <div class="no-reservations" style="grid-column: 1 / -1;">
        <h2>No Reservations Yet</h2>
        <p>Waiting for customers to book tables...</p>
      </div>
    `;
    return;
  }

  // Sort by creation date (newest first)
  const sorted = [...allReservations].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  sorted.forEach(reservation => {
    const card = document.createElement('div');
    card.className = 'reservation-card';
    
    const guestWord = reservation.guests === '1' ? 'Guest' : 'Guests';
    const messageHTML = reservation.message 
      ? `<div class="reservation-message">"${reservation.message}"</div>` 
      : '';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <h3>${reservation.name}</h3>
        <span class="status-badge">Booked</span>
      </div>
      <div class="reservation-details">
        <div class="detail-row">
          <span class="detail-label">📧 Email</span>
          <span class="detail-value">${reservation.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Date</span>
          <span class="detail-value">${formatDate(reservation.date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🕐 Time</span>
          <span class="detail-value">${formatTime(reservation.time)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👥 Guests</span>
          <span class="detail-value">${reservation.guests} ${guestWord}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Total</span>
          <span class="detail-value">₦${reservation.total || reservation.foods?.reduce((sum, f) => sum + f.price, 0) || 0}</span>
        </div>
      </div>
      ${messageHTML}
      <div class="reservation-time">Booked ${formatTimestamp(reservation.createdAt)}</div>
    `;
    
    reservationsBoard.appendChild(card);
  });
}

// Auto-refresh every 3 seconds
setInterval(fetchData, 3000);

// Initial load
fetchData();
