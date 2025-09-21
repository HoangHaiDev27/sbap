// API Configuration
const API_BASE_URL = "http://localhost:5757";

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  BOOK_DETAIL: (id) => `${API_BASE_URL}/api/books/${id}`,
  READ_BOOKS: `${API_BASE_URL}/api/books/read`,
  AUDIO_BOOKS: `${API_BASE_URL}/api/books/audio`,
  AUDIO_BOOK_DETAIL: (id) => `${API_BASE_URL}/api/books/audio/${id}`,
  RELATED_BOOKS: (id) => `${API_BASE_URL}/api/books/${id}/related`,


  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
    FORGOT: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET: `${API_BASE_URL}/api/auth/reset-password`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google-login`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
    REVOKE_TOKEN: `${API_BASE_URL}/api/auth/revoke-token`,
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

  // Chapter Purchase endpoints
  CHAPTER_PURCHASE: {
    PURCHASE: `${API_BASE_URL}/api/chapterpurchase/purchase`,
    CHECK_OWNERSHIP: `${API_BASE_URL}/api/chapterpurchase/check-ownership`,
    MY_PURCHASES: `${API_BASE_URL}/api/chapterpurchase/my-purchases`,
  },
  // Other endpoints can be added here
  // BOOKS: `${API_BASE_URL}/api/books`,
  // ORDERS: `${API_BASE_URL}/api/orders`,

  // Book owner endpoints
  BOOKS: {
    GET_ALL_BY_OWNER: (ownerId) => `${API_BASE_URL}/api/books/owner/${ownerId}`,
    GET_BY_ID: (bookId) => `${API_BASE_URL}/api/books/${bookId}`,
    CREATE: `${API_BASE_URL}/api/books`,
    UPDATE: (bookId) => `${API_BASE_URL}/api/books/${bookId}`,
    DELETE: (bookId) => `${API_BASE_URL}/api/books/${bookId}`,
  },
  CATEGORIES: {
    GET_ALL: `${API_BASE_URL}/api/categories`,
  },
  UPLOADBOOKIMAGE: `${API_BASE_URL}/api/upload/bookImage`,
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
