import { API_ENDPOINTS } from '../config/apiConfig';
import { getToken, authFetch } from './authApi';

// Hàm dùng chung để xử lý fetch và lỗi
async function handleFetch(url, options = {}, defaultError = "Có lỗi xảy ra") {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  const res = await authFetch(url, { ...options, headers: { ...headers, ...options.headers } });
  
  if (!res.ok) {
    let errorMessage = defaultError;
    try {
      const data = await res.json();
      errorMessage = data.message || errorMessage;
    } catch {
      if (res.status === 500) {
        errorMessage = "Lỗi hệ thống.";
      }
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

const OWNER_DASHBOARD_API = {
  // Lấy thống kê tổng quan
  getStats: () => handleFetch(API_ENDPOINTS.OWNER_DASHBOARD.STATS, {}, "Không thể lấy thống kê"),
  
  // Lấy doanh thu theo thể loại
  getRevenueByCategory: () => handleFetch(API_ENDPOINTS.OWNER_DASHBOARD.REVENUE_BY_CATEGORY, {}, "Không thể lấy doanh thu theo thể loại"),
  
  // Lấy dữ liệu bán hàng theo tháng
  getMonthlySales: (startDate = null, endDate = null) => {
    let url = API_ENDPOINTS.OWNER_DASHBOARD.MONTHLY_SALES;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return handleFetch(url, {}, "Không thể lấy dữ liệu bán hàng theo tháng");
  },
  
  // Lấy đơn hàng gần nhất
  getRecentOrders: (limit = 10) => handleFetch(API_ENDPOINTS.OWNER_DASHBOARD.RECENT_ORDERS(limit), {}, "Không thể lấy đơn hàng gần nhất"),
  
  // Lấy top sách bán chạy
  getBestSellers: (limit = 5) => handleFetch(API_ENDPOINTS.OWNER_DASHBOARD.BEST_SELLERS(limit), {}, "Không thể lấy danh sách sách bán chạy"),
  
  // Lấy toàn bộ dữ liệu dashboard
  getDashboard: () => handleFetch(API_ENDPOINTS.OWNER_DASHBOARD.DASHBOARD, {}, "Không thể tải dữ liệu dashboard")
};

export default OWNER_DASHBOARD_API;

