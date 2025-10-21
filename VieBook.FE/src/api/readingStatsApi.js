import { API_ENDPOINTS } from '../config/apiConfig';

const readingStatsApi = {
  // Lấy số sách đã đọc
  getBooksReadCount: async (userId) => {
    try {
      const response = await fetch(API_ENDPOINTS.READING_STATS.BOOKS_READ(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books read count:', error);
      throw error;
    }
  },

  // Lấy số sách đã mua
  getBooksPurchasedCount: async (userId) => {
    try {
      const response = await fetch(API_ENDPOINTS.READING_STATS.BOOKS_PURCHASED(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books purchased count:', error);
      throw error;
    }
  },

  // Lấy số sách yêu thích
  getFavoritesCount: async (userId) => {
    try {
      const response = await fetch(API_ENDPOINTS.READING_STATS.FAVORITES(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      throw error;
    }
  },

  // Lấy số sách đã nghe
  getBooksListenedCount: async (userId) => {
    try {
      const response = await fetch(API_ENDPOINTS.READING_STATS.BOOKS_LISTENED(userId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching books listened count:', error);
      throw error;
    }
  }
};

export default readingStatsApi;
