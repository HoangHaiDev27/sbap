// API Configuration
export const API_BASE_URL = "http://localhost:5757";

// API Endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USERS: `${API_BASE_URL}/api/users`,
  USER_ME: `${API_BASE_URL}/api/users/me1`,
  USER_EMAIL: `${API_BASE_URL}/api/users/email`,
  BOOK_DETAIL: (id) => `${API_BASE_URL}/api/books/${id}`,
  READ_BOOKS: `${API_BASE_URL}/api/books/read`,
  AUDIO_BOOKS: `${API_BASE_URL}/api/books/audio`,
  AUDIO_BOOK_DETAIL: (id) => `${API_BASE_URL}/api/books/audio/${id}`,
  RELATED_BOOKS: (id) => `${API_BASE_URL}/api/books/${id}/related`,

  // Reviews
  REVIEWS: {
    BY_BOOK: (bookId) => `${API_BASE_URL}/api/bookreviews/book/${bookId}`,
    CREATE: `${API_BASE_URL}/api/bookreviews`,
    OWNER_REPLY: (reviewId) => `${API_BASE_URL}/api/bookreviews/${reviewId}/reply`,
    CAN_REVIEW: (bookId) => `${API_BASE_URL}/api/bookreviews/can-review/${bookId}`,
    OWNER: `${API_BASE_URL}/api/bookreviews/owner`,
    OWNER_STATS: `${API_BASE_URL}/api/bookreviews/owner/stats`
  },



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

  // Payment Request endpoints
  PAYMENT_REQUESTS: {
    BASE: `${API_BASE_URL}/api/paymentrequest`,
    CREATE: `${API_BASE_URL}/api/paymentrequest`,
    USER: `${API_BASE_URL}/api/paymentrequest/user`,
    ALL: `${API_BASE_URL}/api/paymentrequest/all`, // For staff
  },

  // VietQR endpoints
  VIETQR: {
    BASE: `${API_BASE_URL}/api/vietqr`,
    BANKS: `${API_BASE_URL}/api/vietqr/banks`,
    GENERATE: `${API_BASE_URL}/api/vietqr/generate`,
  },

  // OpenAI endpoints
  OPENAI: {
    CHECK_SPELLING: `${API_BASE_URL}/api/openai/check-spelling`,
    CHECK_MEANING: `${API_BASE_URL}/api/openai/check-meaning`,
    MODERATION: `${API_BASE_URL}/api/openai/moderation`,
    CHECK_PLAGIARISM: `${API_BASE_URL}/api/openai/check-plagiarism`,
    GENERATE_EMBEDDINGS: `${API_BASE_URL}/api/openai/generate-embeddings`,
    SUMMARIZE: `${API_BASE_URL}/api/openai/summarize`,
  },

  //Chatbase endpoints
  CHATBASE: {
    SEND_MESSAGE: `${API_BASE_URL}/api/chatbase/send-message`,
    GET_CHAT_HISTORY: `${API_BASE_URL}/api/chatbase/chat-history`,
  },

  // Chat endpoints
  CHAT: {
    GET_CONVERSATIONS: `${API_BASE_URL}/api/chat/conversations`,
    GET_CHAT_HISTORY: `${API_BASE_URL}/api/chat/conversations`,
    SEND_MESSAGE: `${API_BASE_URL}/api/chat/messages`,
    START_SUPPORT_CHAT: `${API_BASE_URL}/api/chat/start-support-chat`,
    STAFF: {
      GET_OWNERS: `${API_BASE_URL}/api/staff/staffchat/owners`,
        SEARCH_OWNERS: `${API_BASE_URL}/api/staff/staffchat/owners/search`,
        START_WITH_OWNER: (ownerId) => `${API_BASE_URL}/api/staff/staffchat/owners/${ownerId}/start`,
      GET_OWNER_MESSAGES: `${API_BASE_URL}/api/staff/staffchat/owners`,
      SEND_MESSAGE: `${API_BASE_URL}/api/staff/staffchat/messages`,
    },
  },

  // Notification endpoints
  NOTIFICATIONS: `${API_BASE_URL}/api/notification`,
  USER_NOTIFICATIONS: (userId) => `${API_BASE_URL}/api/notification/user/${userId}`,
  USER_UNREAD_NOTIFICATIONS: (userId) => `${API_BASE_URL}/api/notification/user/${userId}/unread`,

  // Bookmark endpoints
  BOOKMARKS: {
    USER_BOOKMARKS: `${API_BASE_URL}/api/bookmark/user`,
    CHAPTER: `${API_BASE_URL}/api/bookmark/chapter`,
    CREATE_UPDATE: `${API_BASE_URL}/api/bookmark`,
    DELETE: `${API_BASE_URL}/api/bookmark`,
    DELETE_CHAPTER: `${API_BASE_URL}/api/bookmark/chapter`,
  },
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

  // Order Item endpoints
  ORDER_ITEM: {
    PURCHASED_BOOKS: (userId) => `${API_BASE_URL}/api/OrderItem/purchased-books/${userId}`,
    GET_BY_ID: (orderItemId) => `${API_BASE_URL}/api/OrderItem/${orderItemId}`,
    GET_DETAIL: (orderItemId) => `${API_BASE_URL}/api/OrderItem/detail/${orderItemId}`,
    PURCHASED_CHAPTERS: (userId, bookId) => `${API_BASE_URL}/api/OrderItem/purchased-chapters/${userId}/${bookId}`,
    // Owner endpoints (auto-extract userId from JWT token)
    MY_ORDERS: `${API_BASE_URL}/api/OrderItem/my-orders`,
    MY_ORDER_STATS: `${API_BASE_URL}/api/OrderItem/my-orders/stats`,
  },
  // Wishlist endpoints
  WISHLIST: {
    CHECK: (bookId) => `${API_BASE_URL}/api/wishlist/${bookId}/check`,
    ADD: (bookId) => `${API_BASE_URL}/api/wishlist/${bookId}`,
    REMOVE: (bookId) => `${API_BASE_URL}/api/wishlist/${bookId}`,
    TOGGLE: (bookId) => `${API_BASE_URL}/api/wishlist/${bookId}/toggle`,
    MY_LIST: `${API_BASE_URL}/api/wishlist/me`,
  },

  // Feedback endpoints
  FEEDBACK: {
    BOOK_REPORT: `${API_BASE_URL}/api/feedback/book-report`,
  },

  // Reading History endpoints
  READING_HISTORY: {
    BASE: `${API_BASE_URL}/api/ReadingHistory`,
    SAVE_PROGRESS: `${API_BASE_URL}/api/ReadingHistory/save-progress`,
    CURRENT_PROGRESS: `${API_BASE_URL}/api/ReadingHistory/current-progress`,
    PAGINATED: `${API_BASE_URL}/api/ReadingHistory/paginated`,
  },

  // Reading Stats endpoints
  READING_STATS: {
    BOOKS_READ: (userId) => `${API_BASE_URL}/api/ReadingStats/user/${userId}/books-read`,
    BOOKS_PURCHASED: (userId) => `${API_BASE_URL}/api/ReadingStats/user/${userId}/books-purchased`,
    FAVORITES: (userId) => `${API_BASE_URL}/api/ReadingStats/user/${userId}/favorites`,
    BOOKS_LISTENED: (userId) => `${API_BASE_URL}/api/ReadingStats/user/${userId}/books-listened`,
  },
  // Other endpoints can be added here
  // BOOKS: `${API_BASE_URL}/api/books`,
  // ORDERS: `${API_BASE_URL}/api/orders`,

  // Book owner endpoints
  BOOKS: {
    GET_ALL_BY_OWNER: (ownerId) => `${API_BASE_URL}/api/books/owner/${ownerId}`,
    GET_BY_ID: (bookId) => `${API_BASE_URL}/api/books/detail/${bookId}`,
    CREATE: `${API_BASE_URL}/api/books`,
    CREATE_WITH_SIGNATURE: `${API_BASE_URL}/api/books/create-with-signature`,
    UPDATE: (bookId) => `${API_BASE_URL}/api/books/${bookId}`,
    DELETE: (bookId) => `${API_BASE_URL}/api/books/${bookId}`,
    UPDATE_COMPLETION_STATUS: (bookId) => `${API_BASE_URL}/api/books/${bookId}/completion-status`,
    CHECK_ACTIVE_CHAPTERS: (bookId) => `${API_BASE_URL}/api/books/${bookId}/check-active-chapters`,
    UPDATE_STATUS: (bookId) => `${API_BASE_URL}/api/books/${bookId}/status`,
    CHECK_ALL_CHAPTERS_ACTIVE: (bookId) => `${API_BASE_URL}/api/books/${bookId}/check-all-chapters-active`,
    CHECK_DRAFT_CHAPTERS: (bookId) => `${API_BASE_URL}/api/books/${bookId}/check-draft-chapters`,
    UPDATE_DRAFT_CHAPTERS_TO_INACTIVE: (bookId) => `${API_BASE_URL}/api/books/${bookId}/update-draft-chapters-to-inactive`,
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
    INCREMENT_VIEW: (chapterId) => `${API_BASE_URL}/api/chapter/${chapterId}/increment-view`,
  },

  AUDIO_CONVERSION: {
    GENERATE: (chapterId, voiceName = "banmai", speed = 1.0) =>
      `${API_BASE_URL}/api/audioconversion/generate/${chapterId}?voiceName=${voiceName}&speed=${speed}`,
    GET_CHAPTER_AUDIOS: (chapterId) => `${API_BASE_URL}/api/audioconversion/chapter/${chapterId}/audios`,
    GET_LATEST_CHAPTER_AUDIO: (chapterId) => `${API_BASE_URL}/api/audioconversion/chapter/${chapterId}/latest-audio`,
    GET_BOOK_CHAPTER_AUDIOS: (bookId) => `${API_BASE_URL}/api/audioconversion/book/${bookId}/chapter-audios`,
    DELETE_AUDIO: (audioId) => `${API_BASE_URL}/api/audioconversion/audio/${audioId}`,
    UPDATE_AUDIO_PRICE: (audioId) => `${API_BASE_URL}/api/audioconversion/audio/${audioId}/price`,
    UPDATE_CHAPTER_AUDIOS_PRICE: (chapterId) => `${API_BASE_URL}/api/audioconversion/chapter/${chapterId}/price`,
    GET_SUBSCRIPTION_STATUS: (userId) => `${API_BASE_URL}/api/audioconversion/subscription/status?userId=${userId}`,
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
  UPLOADCERTIFICATE: `${API_BASE_URL}/api/upload/certificate`,
  PROMOTIONS: {
    GET_BY_OWNER: (ownerId) => `${API_BASE_URL}/api/promotions/owner/${ownerId}`,
    CREATE: `${API_BASE_URL}/api/promotions`,
    STATS_BY_OWNER: (ownerId) => `${API_BASE_URL}/api/promotions/owner/${ownerId}/stats`
  },
  RANK: {
    GETRANKINGSUMMARY: `${API_BASE_URL}/api/rankings`,
    GETRANKINGLIST: `${API_BASE_URL}/api/rankings/details`,
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
    TOGGLE_STATUS: (staffId) => `${API_BASE_URL}/api/staff/toggle-status/${staffId}`,
  },
  ADMIN: {
    GETADMINBYID: (adminId) => `${API_BASE_URL}/api/admin/${adminId}`,
    UPDATE: (adminId) => `${API_BASE_URL}/api/admin/update/${adminId}`,
    STATISTICS: (from, to) => {
      let url = `${API_BASE_URL}/api/admin/statistics`;
      if (from && to) {
        url += `?fromDate=${from}&toDate=${to}`;
      }
      return url;
    },    
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

  // Transaction Management endpoints
  TRANSACTIONS: {
    GET_ALL: `${API_BASE_URL}/api/transaction`,
    GET_STATS: `${API_BASE_URL}/api/transaction/stats`,
    GET_DETAIL: (transactionId) => `${API_BASE_URL}/api/transaction/${transactionId}`,
    UPDATE_STATUS: (transactionId) => `${API_BASE_URL}/api/transaction/${transactionId}/status`,
  },
  API_BASE_URL: API_BASE_URL,

  // Owner Dashboard endpoints
  OWNER_DASHBOARD: {
    STATS: `${API_BASE_URL}/api/OwnerDashboard/stats`,
    REVENUE_BY_CATEGORY: `${API_BASE_URL}/api/OwnerDashboard/revenue-by-category`,
    MONTHLY_SALES: `${API_BASE_URL}/api/OwnerDashboard/monthly-sales`,
    RECENT_ORDERS: (limit = 5) => `${API_BASE_URL}/api/OwnerDashboard/recent-orders?limit=${limit}`,
    BEST_SELLERS: (limit = 5) => `${API_BASE_URL}/api/OwnerDashboard/best-sellers?limit=${limit}`,
    DASHBOARD: `${API_BASE_URL}/api/OwnerDashboard/dashboard`
  },

  // Staff Dashboard endpoints
  STAFF_DASHBOARD: {
    STATS: `${API_BASE_URL}/api/StaffDashboard/stats`,
    TOP_BOOKS: (limit = 5) => `${API_BASE_URL}/api/StaffDashboard/top-books?limit=${limit}`,
    TOP_OWNERS: (limit = 5) => `${API_BASE_URL}/api/StaffDashboard/top-owners?limit=${limit}`,
    PENDING_BOOKS: (limit = 5) => `${API_BASE_URL}/api/StaffDashboard/pending-books?limit=${limit}`,
    RECENT_FEEDBACKS: (limit = 5) => `${API_BASE_URL}/api/StaffDashboard/recent-feedbacks?limit=${limit}`,
    DASHBOARD: `${API_BASE_URL}/api/StaffDashboard/dashboard`
  }

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
