// API Configuration
const API_BASE_URL = "http://localhost:5757";

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE_LINK: `${API_BASE_URL}/create-payment-link`,
    VERIFY: `${API_BASE_URL}/api/webhook/verify-payment`,
  },
  
  // Other endpoints can be added here
  // BOOKS: `${API_BASE_URL}/api/books`,
  // ORDERS: `${API_BASE_URL}/api/orders`,
};

// Helper function to get full API URL
export const getFullApiUrl = (endpoint) => {
  if (typeof endpoint === 'string') {
    return API_ENDPOINTS[endpoint] || `${API_BASE_URL}${endpoint}`;
  }
  return endpoint;
};

// Default export for backward compatibility
export default API_BASE_URL;
