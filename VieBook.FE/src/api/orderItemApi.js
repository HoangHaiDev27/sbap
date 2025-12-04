import { API_ENDPOINTS } from '../config/apiConfig';
import { authFetch } from './authApi';

const orderItemApi = {
  // Lấy tất cả lịch sử mua sách của user (không phân trang)
  getPurchasedBooks: async (userId, params = {}) => {
    const {
      timeFilter = 'all',
      sortBy = 'recent'
    } = params;

    const queryParams = new URLSearchParams({
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
      
      // Log API response for debugging
      console.log('API Response for purchased books:', {
        url,
        params,
        response: data
      });
      
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
  },


  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (orderItemId) => {
    const url = API_ENDPOINTS.ORDER_ITEM.GET_DETAIL(orderItemId);

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

      // Log API response for debugging
      console.log('API Response for order detail:', {
        url,
        response: data
      });

      return data;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      throw error;
    }
  },

  // Lấy danh sách orders của owner hiện tại (không cần truyền ownerId)
  getMyOrders: async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.ORDER_ITEM.MY_ORDERS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  },

  // Lấy thống kê orders của owner hiện tại (không cần truyền ownerId)
  getMyOrderStats: async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.ORDER_ITEM.MY_ORDER_STATS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching my order stats:', error);
      throw error;
    }
  }
};

export default orderItemApi;
