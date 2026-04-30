// Mock authentication module for client-side applications
/* Netlify/GitHub Pages 100% - No "server" error EVER */

window.auth = {
  login: async function(username, password) {
    // Simulate server delay
    await new Promise(resolve => setTimeout(resolve, 500));
    // mock authentication logic 
    if (username === 'admin' && password === 'password') {
        return {sucess : true, token}
    } else {
        return {sucess : false, error: 'invalid credentials'}

    }
  },
    logout: function () {
        // clear token from local storage 
        localStorage.removeItem('authToken');
    }, 
    isAuthenticated: function() {
        // check if token exists in local storage
        return !!localStorage.getItem('authToken');
        
    }
