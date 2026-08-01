/**
 * Reservations Board - STATIC VERSION for Netlify
 * Loads data from static JSON files + fallback samples
 */

// ========== LOGIN FUNCTIONALITY ==========
function checkLogin(){
  const userData = JSON.parse(localStorage.getItem('userData'));
  if(userData && userData.email){
    // User is logged in, display their email
    document.getElementById('user-email').textContent = userData.email;
  }
  
}