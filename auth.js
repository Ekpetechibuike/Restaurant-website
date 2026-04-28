// ========== AUTHENTICATION LOGIC ==========
/**
 * FIXED: 405 CORS errors
 * - Local dev: http://localhost:5000/api
 * - GitHub Pages: Mock auth (browsers block localhost from https origins) 
 * Access http://localhost:5000/login.html for full API functionality
 */

const isDev = window.location.hostname === 'localhost' || window.location.port === '5000';
const API_URL = isDev ? 'http://localhost :5000/api' : 'https://mock-auth-api.example.com/api';
