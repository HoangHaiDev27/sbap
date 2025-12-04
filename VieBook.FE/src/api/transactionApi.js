import { API_ENDPOINTS } from "../config/apiConfig";
import { authFetch } from "./authApi";

const API_URL = `${API_ENDPOINTS.API_BASE_URL}/api/Users`;

// Lấy lịch sử giao dịch của user hiện tại (kết hợp WalletTransaction và OrderItem)
export async function getUserTransactionHistory() {
  try {
    const response = await authFetch(`${API_URL}/transaction-history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch transaction history");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

// Lấy danh sách giao dịch ví của user hiện tại
export async function getUserWalletTransactions() {
  try {
    const response = await authFetch(`${API_URL}/wallet-transactions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch wallet transactions");
    }
    
    const data = await response.json();
    return data.data; // Extract data from Response object
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    throw error;
  }
}

// Transaction API functions cho Staff
export const transactionApi = {
  // Lấy danh sách giao dịch với bộ lọc và phân trang (Staff)
  getTransactions: async (params = {}) => {
    try {
      const {
        searchTerm = '',
        typeFilter = 'all',
        statusFilter = 'all',
        dateFilter = 'all',
        userId = null,
        page = 1,
        pageSize = 10
      } = params;

      const queryParams = new URLSearchParams({
        searchTerm,
        typeFilter,
        statusFilter,
        dateFilter,
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (userId) {
        queryParams.append('userId', userId.toString());
      }

      const response = await authFetch(`${API_ENDPOINTS.TRANSACTIONS.GET_ALL}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập tính năng này.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Lấy thống kê giao dịch (Staff)
  getTransactionStats: async (params = {}) => {
    try {
      const {
        typeFilter = 'all',
        statusFilter = 'all',
        dateFilter = 'all',
        userId = null
      } = params;

      const queryParams = new URLSearchParams({
        typeFilter,
        statusFilter,
        dateFilter
      });

      if (userId) {
        queryParams.append('userId', userId.toString());
      }

      const response = await authFetch(`${API_ENDPOINTS.TRANSACTIONS.GET_STATS}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập tính năng này.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  },

  // Lấy chi tiết giao dịch (Staff)
  getTransactionDetail: async (transactionId) => {
    try {
      const response = await authFetch(API_ENDPOINTS.TRANSACTIONS.GET_DETAIL(transactionId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái giao dịch (Staff)
  updateTransactionStatus: async (transactionId, status, notes = null) => {
    try {
      const response = await authFetch(API_ENDPOINTS.TRANSACTIONS.UPDATE_STATUS(transactionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập tính năng này.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }
};

export default transactionApi;