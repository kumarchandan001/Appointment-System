// client/js/auth.js
/**
 * Authentication Helper Functions
 */

// Debug: Log the origin being used
console.log('🔍 DEBUG: Current origin:', window.location.origin);
console.log('🔍 DEBUG: Current hostname:', window.location.hostname);
console.log('🔍 DEBUG: Current port:', window.location.port);

// Global API_BASE - read from environment variable or detect automatically
// On Vercel: window.API_BASE will be set from environment variable
// Locally: falls back to http://localhost:4000/api
// For same-domain deployment: uses /api (relative URL)
const detectedAPI = 
  window.API_BASE_OVERRIDE || // Check if explicitly set by HTML
  process.env.REACT_APP_API_URL || // Vercel environment variable
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/api' 
    : `${window.location.origin}/api`); // Use relative path for same-domain

window.API_BASE = detectedAPI;

// Debug: Log API base
console.log('🔍 DEBUG: API_BASE set to:', window.API_BASE);

/**
 * Get authorization headers with JWT token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Login user with email and password
 */
async function login(email, password) {
  try {
    const response = await fetch(`${window.API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userName', data.user.name);
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userEmail', data.user.email);

    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Signup new user
 */
async function signup(name, email, password, role, phone, timeZone) {
  try {
    const url = `${window.API_BASE}/auth/signup`;
    console.log('📤 Sending signup request to:', url);
    console.log('📋 Request body:', { name, email, password: '***', role, phone, timeZone });
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        phone,
        timeZone: timeZone || 'UTC',
      }),
    });

    const data = await response.json();

    console.log('✅ Signup response received:', { status: response.status, data });

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    // Store token and user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userName', data.user.name);
    localStorage.setItem('userRole', data.user.role);
    localStorage.setItem('userEmail', data.user.email);

    return data.user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Check if user is provider
 */
function isProvider() {
  return localStorage.getItem('userRole') === 'provider';
}

/**
 * Check if user is patient
 */
function isPatient() {
  return localStorage.getItem('userRole') === 'patient';
}

/**
 * Logout user
 */
function logout() {
  localStorage.clear();
  window.location.href = '/';
  window.location.reload();
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/pages/login.html';
  }
}
