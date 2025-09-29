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
    ACTIVE_ACCOUNT: `${API_BASE_URL}/api/auth/active-account`,
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
  BOOK_SEARCH: (query) => `${API_BASE_URL}/api/books/search?query=${encodeURIComponent(query)}`,
  RECOMMENDATIONS: `${API_BASE_URL}/api/books/recommendations`,
  CHAPTERS: {
    GET_BY_ID: (chapterId) => `${API_BASE_URL}/api/chapter/${chapterId}`,
    GET_BY_BOOK_ID: (bookId) => `${API_BASE_URL}/api/chapter/book/${bookId}`,
    CREATE: `${API_BASE_URL}/api/chapter`,
    UPDATE: (chapterId) => `${API_BASE_URL}/api/chapter/${chapterId}`,
    DELETE: (chapterId) => `${API_BASE_URL}/api/chapter/${chapterId}`,
    UPLOAD_FILE: `${API_BASE_URL}/api/upload/uploadChapterFile`,
  },

  CATEGORIES: {
    GET_ALL: `${API_BASE_URL}/api/categories`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/categories/${id}`,
    CREATE: `${API_BASE_URL}/api/categories`,
    UPDATE: (id) => `${API_BASE_URL}/api/categories/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/categories/${id}`,
  },
  UPLOADBOOKIMAGE: `${API_BASE_URL}/api/upload/bookImage`,
  REMOVEOLDBOOKIMAGE: `${API_BASE_URL}/api/upload/bookImage`,
  PROMOTIONS: {
    GET_BY_OWNER: (ownerId) => `${API_BASE_URL}/api/promotions/owner/${ownerId}`,
    CREATE: `${API_BASE_URL}/api/promotions`
  },



  UPLOADAVATARIMAGE: `${API_BASE_URL}/api/upload/avatarImage`,
  //Staff
  STAFF: {
    GETALLSTAFF: () => `${API_BASE_URL}/api/staff`,
    GETSTAFFBYID: (staffId) => `${API_BASE_URL}/api/staff/${staffId}`,
    ADD: `${API_BASE_URL}/api/staff/add`,
    UPDATE: (staffId) => `${API_BASE_URL}/api/staff/update/${staffId}`,
    DELETE: (staffId) => `${API_BASE_URL}/api/staff/delete/${staffId}`,
    LOCK: (staffId) => `${API_BASE_URL}/api/staff/lock/${staffId}`,
    UNLOCK: (staffId) => `${API_BASE_URL}/api/staff/unlock/${staffId}`,
    TOGGLE_STATUS: (staffId) => `${API_BASE_URL}/api/staff/toggle-status/${staffId}`
  },
  ADMIN: {
    GETADMINBYID: (adminId) => `${API_BASE_URL}/api/admin/${adminId}`,
    UPDATE: (adminId) => `${API_BASE_URL}/api/admin/update/${adminId}`
  },
  BOOKAPPROVAL: {
    GET_ALL: `${API_BASE_URL}/api/BookApproval`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/BookApproval/${id}`,
    ADD: `${API_BASE_URL}/api/BookApproval`,
    APPROVE: (id) => `${API_BASE_URL}/api/BookApproval/approve/${id}`,
    REFUSE: (id) => `${API_BASE_URL}/api/BookApproval/refuse/${id}`,
    GET_LATEST_BY_BOOKID: (bookId) => `${API_BASE_URL}/api/BookApproval/latest/${bookId}`,
    GET_ALL_ACTIVE_BOOKS: `${API_BASE_URL}/api/BookApproval/active-books`,
    GET_ALL_USERS_WITH_PROFILE: `${API_BASE_URL}/api/BookApproval/users`
  },
        USER_MANAGEMENT: {
          GET_USERS_BY_ROLE: (roleName) => `${API_BASE_URL}/api/staff/users-by-role/${roleName}`,
          GET_BOOK_OWNERS: `${API_BASE_URL}/api/staff/book-owners`,
          GET_CUSTOMERS: `${API_BASE_URL}/api/staff/customers`,
          GET_USER_DETAIL: (id) => `${API_BASE_URL}/api/staff/users/${id}`,
          TOGGLE_STATUS: (id) => `${API_BASE_URL}/api/staff/toggle-user-status/${id}`,
          LOCK_USER: (id) => `${API_BASE_URL}/api/staff/lock-user/${id}`,
          UNLOCK_USER: (id) => `${API_BASE_URL}/api/staff/unlock-user/${id}`,
          SEND_EMAIL: `${API_BASE_URL}/api/staff/send-email`,
          GET_USER_SUBSCRIPTION: (id) => `${API_BASE_URL}/api/staff/users/${id}/subscription`,
        },
  API_BASE_URL: API_BASE_URL,

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
