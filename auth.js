// Mock authentication module for demonstration purposes
// In a real application, this would involve API calls to a backend server
// This mock module allows us to simulate login/logout without a server

// Define window.auth object with all required methods
window.auth = {
  // Check if user is authenticated
  isAuthenticated: function() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Login function
  login: async function(username, password) {
    try {
      // Fetch users from local JSON file
      const response = await fetch('users.json');
      const users = await response.json();
      
      // Find user by username
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      // Create auth token
      const token = 'auth-token-' + Date.now();
      
      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update profile navigation
      updateProfileNav(user);
      
      // Redirect to home
      window.location.href = 'index.html';
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register function
  register: async function(email, phone, username, password) {
    try {
      // Fetch existing users
      const response = await fetch('users.json');
      const users = await response.json();
      
      // Check if username already exists
      if (users.some(u => u.username === username)) {
        throw new Error('Username already exists');
      }
      
      // Check if email already exists
      if (users.some(u => u.email === email)) {
        throw new Error('Email already exists');
      }
      
      // Create new user
      const newUser = {
        id: Date.now(),
        email: email,
        username: username,
        password: password,
        phone: phone,
        loginDate: new Date().toISOString(),
        image: 'assets/images/default-avatar.jpg'
      };
      
      // Add to users array
      users.push(newUser);
      
      // Note: In a static-only site, we can't write back to users.json
      // For demo purposes, we'll save to localStorage instead
      const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      localUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(localUsers));
      
      // Auto-login after registration
      const token = 'auth-token-' + Date.now();
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update profile navigation
      updateProfileNav(newUser);
      
      // Redirect to home
      window.location.href = 'index.html';
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout function
  logout: function() {
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
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already authenticated on page load
  if (window.auth.isAuthenticated()) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    updateProfileNav(user);
  }
});

// Helper function for error messages (shared across pages)
function showError(message, container = document) {
  const errorDiv = container.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth' });
  } else {
    alert(message);
  }
  setTimeout(() => {
    if (errorDiv) errorDiv.style.display = 'none';
  }, 5000);
}
