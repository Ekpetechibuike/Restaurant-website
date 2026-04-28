// ========== AUTHENTICATION LOGIC ==========
//
// FIXED 405 ERROR: Hardcoded localhost:5000 API_URL for development.
// GitHub Pages can't handle POST APIs. Use http://localhost:5000 for all pages.
const API_URL = 'http://localhost:5000/api';

// Check if user is already logged in
async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    try {
      // Note: Server has no /api/user endpoint, so skip token validation for now
      // Just trust localStorage (common for simple apps)
      const currentUser = JSON.parse(user);
      if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        window.location.href = 'profile.html';
      }
      return currentUser;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  } else if (window.location.pathname.includes('profile.html') || window.location.pathname.includes('reservations-board.html')) {
    window.location.href = 'login.html';
  }
}

// Login function - FIXED: uses username (matches server expectation)
async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }) // FIXED: username, not email
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'profile.html';
      return data;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Server not running. Please start the server first.');
    }
    throw error;
  }
}

// Register function - FIXED: matches server field names
async function register(email, phone, username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, phone, username, password }) // FIXED: server expects phone, not firstName/surname
    });
    
    if (response.ok) {
      // Don't auto-login after register
      window.location.href = 'login.html';
      return await response.json();
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Server not running. Please start the server first.');
    }
    throw error;
  }
}

// Logout function
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Export for use in other scripts
window.auth = {
  login,
  register,
  logout,
  getCurrentUser,
  checkLoginStatus
};

