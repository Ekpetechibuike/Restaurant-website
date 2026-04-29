// ========== AUTHENTICATION LOGIC ==========
/**
 * 405 Error Fixed - Use http://localhost:5000/login.html
 * GitHub Pages = static preview only
 */

const API_URL = 'https://your-app.onrender.com/api/auth/login';

// Check if user is already logged in
async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    try {
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

// Login
async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
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
      throw new Error('Server not running. Run: cd server && npm start');
    }
    throw error;
  }
}

// Register
async function register(email, phone, username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, phone, username, password })
    });
    
    if (response.ok) {
      window.location.href = 'login.html';
      return await response.json();
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Server not running. Run: cd server && npm start');
    }
    throw error;
  }
}

// Logout
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

// Initialize
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// Export
window.auth = {
  login,
  register,
  logout,
  getCurrentUser,
  checkLoginStatus
};

