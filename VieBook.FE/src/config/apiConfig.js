// API Configuration
const API_BASE_URL = "http://localhost:5757";

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  BOOK_DETAIL: (id) => `${API_BASE_URL}/api/books/${id}`,

  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },

  // Payment endpoints
  PAYMENT: {
    CREATE_LINK: `${API_BASE_URL}/create-payment-link`,
    VERIFY: `${API_BASE_URL}/api/webhook/verify-payment`,
  },

  // Notification endpoints
  NOTIFICATIONS: `${API_BASE_URL}/api/notification`,
  USER_NOTIFICATIONS: (userId) => `${API_BASE_URL}/api/notification/user/${userId}`,
  USER_UNREAD_NOTIFICATIONS: (userId) => `${API_BASE_URL}/api/notification/user/${userId}/unread`,
  USER_UNREAD_COUNT: (userId) => `${API_BASE_URL}/api/notification/user/${userId}/unread-count`,
  USER_RECENT_NOTIFICATIONS: (userId, count = 10) => `${API_BASE_URL}/api/notification/user/${userId}/recent?count=${count}`,
  NOTIFICATION_MARK_READ: (id) => `${API_BASE_URL}/api/notification/${id}/mark-read`,
  USER_MARK_ALL_READ: (userId) => `${API_BASE_URL}/api/notification/user/${userId}/mark-all-read`,
  NOTIFICATION_TYPES: `${API_BASE_URL}/api/notification/types`,
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
