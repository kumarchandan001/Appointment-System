/**
 * Configuration helper for API endpoints
 * Reads from environment variables set by hosting platform (Vercel, etc.)
 */

// Function to get API base URL based on environment
export function getApiBase() {
  // On Vercel: check window._APP_CONFIG (set by HTML or env)
  if (typeof window !== 'undefined' && window._APP_CONFIG && window._APP_CONFIG.apiUrl) {
    console.log('📡 Using API URL from window._APP_CONFIG:', window._APP_CONFIG.apiUrl);
    return window._APP_CONFIG.apiUrl;
  }

  // Fallback: use window.API_BASE set by auth.js
  if (typeof window !== 'undefined' && window.API_BASE) {
    console.log('📡 Using API URL from window.API_BASE:', window.API_BASE);
    return window.API_BASE;
  }

  // Fallback: local development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const localUrl = 'http://localhost:4000/api';
    console.log('📡 Using local development API URL:', localUrl);
    return localUrl;
  }

  // Fallback: same-domain (e.g., Vercel with backend on same domain)
  if (typeof window !== 'undefined') {
    const samedomainUrl = `${window.location.origin}/api`;
    console.log('📡 Using same-domain API URL:', samedomainUrl);
    return samedomainUrl;
  }

  throw new Error('❌ Unable to determine API base URL. Check configuration.');
}

// Export as default
export default {
  getApiBase,
};
