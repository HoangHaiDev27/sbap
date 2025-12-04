import { API_ENDPOINTS } from '../config/apiConfig';
import { authFetch, getToken } from './authApi';

const readingStatsApi = {
  // Lấy số sách đã đọc
  getBooksReadCount: async (userId) => {
    try {
      const token = getToken();
      const response = await authFetch(API_ENDPOINTS.READING_STATS.BOOKS_READ(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Response có thể là số trực tiếp hoặc object, xử lý cả hai trường hợp
      return typeof data === 'number' ? data : (data.count || data.value || data || 0);
    } catch (error) {
      console.error('Error fetching books read count:', error);
      throw error;
    }
  },

  // Lấy số sách đã mua
  getBooksPurchasedCount: async (userId) => {
    try {
      const token = getToken();
      const response = await authFetch(API_ENDPOINTS.READING_STATS.BOOKS_PURCHASED(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Response có thể là số trực tiếp hoặc object, xử lý cả hai trường hợp
      return typeof data === 'number' ? data : (data.count || data.value || data || 0);
    } catch (error) {
      console.error('Error fetching books purchased count:', error);
      throw error;
    }
  },

  // Lấy số sách yêu thích
  getFavoritesCount: async (userId) => {
    try {
      const token = getToken();
      const response = await authFetch(API_ENDPOINTS.READING_STATS.FAVORITES(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Response có thể là số trực tiếp hoặc object, xử lý cả hai trường hợp
      return typeof data === 'number' ? data : (data.count || data.value || data || 0);
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      throw error;
    }
  },

  // Lấy số sách đã nghe
  getBooksListenedCount: async (userId) => {
    try {
      const token = getToken();
      const response = await authFetch(API_ENDPOINTS.READING_STATS.BOOKS_LISTENED(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Response có thể là số trực tiếp hoặc object, xử lý cả hai trường hợp
      return typeof data === 'number' ? data : (data.count || data.value || data || 0);
    } catch (error) {
      console.error('Error fetching books listened count:', error);
      throw error;
    }
  }
};

export default readingStatsApi;
