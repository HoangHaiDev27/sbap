import { API_ENDPOINTS } from '../config/apiConfig';

const orderItemApi = {
  // Lấy lịch sử mua sách của user
  getPurchasedBooks: async (userId, params = {}) => {
    const {
      page = 1,
      pageSize = 6,
      timeFilter = 'all',
      sortBy = 'recent'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      timeFilter,
      sortBy
    });

    const url = `${API_ENDPOINTS.ORDER_ITEM.PURCHASED_BOOKS(userId)}?${queryParams}`;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching purchased books:', error);
      throw error;
    }
  },

  // Lấy chi tiết một order item
  getOrderItemById: async (orderItemId) => {
    const url = API_ENDPOINTS.ORDER_ITEM.GET_BY_ID(orderItemId);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order item:', error);
      throw error;
    }
  },

  // Lấy danh sách chapter đã mua của một sách
  getPurchasedChapters: async (userId, bookId) => {
    const url = API_ENDPOINTS.ORDER_ITEM.PURCHASED_CHAPTERS(userId, bookId);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching purchased chapters:', error);
      throw error;
    }
  }
};

export default orderItemApi;
