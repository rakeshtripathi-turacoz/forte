// Centralized API Configuration
// This file provides a single source of truth for API URLs
//
// IMPORTANT: This detects the backend URL dynamically
// For production builds, set REACT_APP_API_URL in .env file

// Function to get the default API URL based on current environment
const getDefaultApiUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Otherwise, detect from current window location
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // localhost or forte.ac.in
  const port = hostname === 'localhost' ? '8009' : ''; // 8009 for localhost, empty for production

  // Build the URL
  const baseUrl = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
  return `${baseUrl}/api`;
};

const API_CONFIG = {
  // Main API URL - comes from environment variable or auto-detected
  API_URL: getDefaultApiUrl(),

  // Base URL (without /api suffix) - used for file uploads and static assets
  BASE_URL: getDefaultApiUrl().replace('/api', ''),

  // Helper to get full URL for uploaded files
  // Handles both absolute URLs (http/https) and relative paths
  getFileUrl: (filePath) => {
    if (!filePath) return '';

    // If it's already a full URL (starts with http:// or https://), return as-is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    // If it's a data URL (base64 encoded), return as-is
    if (filePath.startsWith('data:')) {
      return filePath;
    }

    // For relative paths, prepend the backend base URL
    const baseUrl = getDefaultApiUrl().replace('/api', '');

    // Remove leading slash to avoid double slashes
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

    return `${baseUrl}/${cleanPath}`;
  },

  // Helper to check if a URL is external (full URL)
  isExternalUrl: (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  }
};

// Log the current API configuration (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    API_URL: API_CONFIG.API_URL,
    BASE_URL: API_CONFIG.BASE_URL
  });
}

export default API_CONFIG;
