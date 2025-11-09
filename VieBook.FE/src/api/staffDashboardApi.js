import { API_ENDPOINTS } from '../config/apiConfig';
import { authFetch, getToken } from './authApi';

async function handleFetch(url, options = {}, defaultError = "Có lỗi xảy ra") {
  try {
    const token = getToken();
    const response = await authFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (response.status === 403) {
        throw new Error('Bạn không có quyền truy cập tính năng này.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || defaultError);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

const STAFF_DASHBOARD_API = {
  // Lấy thống kê tổng quan
  getStats: () => handleFetch(API_ENDPOINTS.STAFF_DASHBOARD.STATS, {}, "Không thể lấy thống kê"),
  
  // Lấy top sách bán chạy
  getTopBooks: (limit = 5) => handleFetch(API_ENDPOINTS.STAFF_DASHBOARD.TOP_BOOKS(limit), {}, "Không thể lấy top sách bán chạy"),
  
  // Lấy top owners
  getTopOwners: (limit = 5) => handleFetch(API_ENDPOINTS.STAFF_DASHBOARD.TOP_OWNERS(limit), {}, "Không thể lấy top owners"),
  
  // Lấy danh sách sách chờ duyệt
  getPendingBooks: (limit = 5) => handleFetch(API_ENDPOINTS.STAFF_DASHBOARD.PENDING_BOOKS(limit), {}, "Không thể lấy danh sách sách chờ duyệt"),
  
  // Lấy danh sách phản hồi gần đây
  getRecentFeedbacks: (limit = 5) => handleFetch(API_ENDPOINTS.STAFF_DASHBOARD.RECENT_FEEDBACKS(limit), {}, "Không thể lấy danh sách phản hồi gần đây"),
  
  // Lấy toàn bộ dữ liệu dashboard
  getDashboard: () => handleFetch(API_ENDPOINTS.STAFF_DASHBOARD.DASHBOARD, {}, "Không thể tải dữ liệu dashboard")
};

export default STAFF_DASHBOARD_API;

