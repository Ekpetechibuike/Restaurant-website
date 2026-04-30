window.auth = {
  login: async (username, password) => {
    if (username === 'chibuike' && password === 'E0k5p9e5') {
      return { success: true, token: 'mock-jwt-token' };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  },
  logout: function() {
    localStorage.removeItem('authToken');
  },
  isAuthenticated: function() {
    return !!localStorage.getItem('authToken');
  }
};
