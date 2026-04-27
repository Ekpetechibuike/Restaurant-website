// ========== AUTHENTICATION LOGIC ==========

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;

// Check if user is already logged in
function checkAuth() {
  const token = localStorage.getItem('authToken');
  if (token && !window.location.pathname.includes('login') && !window.location.pathname.includes('register') && !window.location.pathname.includes('profile')) {
    // User is logged in and on a protected page, continue
    return true;
  } else if (!token && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && !window.location.pathname.includes('profile.html')) {
    // User is not logged in and trying to access protected page
    window.location.href = 'login.html';
    return false;
  }
  return !!token;
}

// Show error message
function showError(message, containerId = 'errorMessage') {
  const el = document.getElementById(containerId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 5000);
  }
}

// Show success message
function showSuccess(message, containerId = 'successMessage') {
  const el = document.getElementById(containerId);
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('✓ Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      } else {
        showError(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error('Login error:', error);
    }
  });
}

// Handle registration form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    

    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;


    // Validate passwords match
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ email, phone, username, password })

      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('✓ Account created successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showError(data.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error('Registration error:', error);
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
