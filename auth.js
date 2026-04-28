// ========== AUTHENTICATION LOGIC ==========

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

// Check if user is already logged in
async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const currentUser = await response.json();
        localStorage.setItem('user', JSON.stringify(currentUser));
        // Redirect based on current page if needed
        if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
          window.location.href = 'profile.html';
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    }
  } else if (window.location.pathname.includes('profile') || window.location.pathname.includes('reservations-board')) {
    window.location.href = 'login.html';
  }
}

// Login function
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'profile.html';
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

// Register function
async function register(name, email, password) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    
    if (response.ok) {
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
  } catch (error) {
    alert('Registration failed: ' + error.message);
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

// Export for use in other scripts if needed
window.auth = {
  login,
  register,
  logout,
  getCurrentUser,
  checkLoginStatus
};

