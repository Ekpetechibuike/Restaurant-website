// ========== AUTHENTICATION LOGIC ==========
/**
 * 405 Error Fixed - Use http://localhost:5000/login.html
 * GitHub Pages = static preview only
 * ERR_CONNECTION_REFUSED Fix: Auto-detects server down → popup guides setup
 */


if (['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname) || window.location.protocol === 'file:') {
  var API_URL = 'https://your-backend.onrender.com/api/auth/login';
  console.warn('Using PRODUCTION API URL:', API_URL);
}
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

// Login with server check + GitHub fallback
async function login(username, password) {
  // 🚨 Server health check FIRST
  try {
    const ping = await fetch(`${API_URL.replace('/api', '')}/ping`, { 
      method: 'HEAD', 
      cache: 'no-store',
      mode: 'no-cors' 
    });
  } catch (pingError) {
    // Server down → friendly popup guide
    if (!localStorage.getItem('serverWarningShown')) {
      alert('🚨 CONNECTION ERROR FIXED!\\n\\nServer not running. Start it now:\\n\\n1. Open VSCode Terminal (Ctrl+\\` )\\n2. cd server\\n3. npm start\\n4. Refresh this page\\n\\nDEMO CREDENTIALS when running:\\nchibuike / E0k5p9e5');
      localStorage.setItem('serverWarningShown', 'true');
      throw new Error('SERVER_DOWN');
    }
    throw new Error('Start server first: cd server && npm start');
  }

  // Real login
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
      localStorage.removeItem('serverWarningShown');
      window.location.href = 'profile.html';
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Register - same server check
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registration failed');
    }
  } catch (error) {
    if (error.message.includes('SERVER_DOWN') || error.name === 'TypeError') {
      throw new Error('Server not running. cd server && npm start');
    }
    throw error;
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('serverWarningShown');
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

