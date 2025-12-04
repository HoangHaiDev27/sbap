import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import {
  RiMoneyDollarCircleLine,
  RiBook2Line,
  RiEyeLine,
  RiStarLine,
  RiCoinLine,
} from "react-icons/ri";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import RecentOrders from "../../components/owner/dashboard/RecentOrders";
import BestSellers from "../../components/owner/dashboard/BestSellers";
import OWNER_DASHBOARD_API from "../../api/ownerDashboardApi";
import { getToken, isBookOwner, getCurrentRole } from "../../api/authApi";

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Kiểm tra authentication và role
  const token = getToken();
  const currentRole = getCurrentRole();
  const isOwner = isBookOwner();

  useEffect(() => {
    
    // Kiểm tra authentication
    if (!token) {
      setError("Bạn cần đăng nhập để truy cập dashboard");
      setLoading(false);
      return;
    }

    // Kiểm tra role owner
    if (!isOwner) {
      setError("Bạn không có quyền truy cập dashboard owner");
      setLoading(false);
      return;
    }

    // Set default date range (6 tháng trước đến hiện tại)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    setDateRange({ startDate: startDateStr, endDate: endDateStr });
    loadDashboardData(startDateStr, endDateStr);
  }, [token, isOwner]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const loadDashboardData = async (startDate = null, endDate = null) => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu dashboard cơ bản
      const dashboardResponse = await OWNER_DASHBOARD_API.getDashboard();
      
      if (dashboardResponse.success) {
        let dashboardData = dashboardResponse.data;
        
        // Luôn lấy dữ liệu monthly sales với date range hiện tại
        const currentStartDate = startDate || dateRange.startDate;
        const currentEndDate = endDate || dateRange.endDate;
        
        if (currentStartDate && currentEndDate) {
          try {
            const monthlySalesResponse = await OWNER_DASHBOARD_API.getMonthlySales(currentStartDate, currentEndDate);
            if (monthlySalesResponse.success) {
              dashboardData.monthlySales = monthlySalesResponse.data;
            }
          } catch (monthlyError) {
            console.warn("Error loading monthly sales:", monthlyError);
            // Vẫn hiển thị dashboard với dữ liệu cũ
          }
        }
        
        setDashboardData(dashboardData);
        setError(null);
      } else {
        setError("Không thể tải dữ liệu dashboard");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatCurrency = (amount) => {
    return `${new Intl.NumberFormat('vi-VN').format(amount)} xu`;
  };

  const handleDateRangeChange = useCallback((startDate, endDate) => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for debounced execution
    const timer = setTimeout(() => {
      // Validation
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = new Date();
        
        // Reset error trước khi validate
        setError(null);
        
        // Kiểm tra ngày bắt đầu không được sau ngày kết thúc
        if (start > end) {
          setError('Ngày bắt đầu không được sau ngày kết thúc');
          return;
        }
        
        // Kiểm tra ngày kết thúc không được sau hôm nay
        if (end > today) {
          setError('Ngày kết thúc không được sau hôm nay');
          // Tự động sửa về hôm nay
          const correctedEndDate = today.toISOString().split('T')[0];
          setDateRange({ startDate, endDate: correctedEndDate });
          // Load dữ liệu với date đã sửa
          setTimeout(() => {
            loadDashboardData(startDate, correctedEndDate);
          }, 100);
          return;
        }
        
        // Kiểm tra không được vượt quá 12 tháng
        const monthsDifference = ((end.getFullYear() - start.getFullYear()) * 12) + 
                                (end.getMonth() - start.getMonth());
        
        if (monthsDifference > 12) {
          setError('Khoảng thời gian không được vượt quá 12 tháng');
          // Tự động sửa về 12 tháng trước
          const correctedStartDate = new Date(end);
          correctedStartDate.setMonth(correctedStartDate.getMonth() - 12);
          const correctedStartDateStr = correctedStartDate.toISOString().split('T')[0];
          setDateRange({ startDate: correctedStartDateStr, endDate });
          // Load dữ liệu với date đã sửa
          setTimeout(() => {
            loadDashboardData(correctedStartDateStr, endDate);
          }, 100);
          return;
        }
        
        // Nếu validation pass, load dữ liệu
        setDateRange({ startDate, endDate });
        loadDashboardData(startDate, endDate);
      } else {
        // Nếu không có đủ date, chỉ cập nhật state
        setDateRange({ startDate, endDate });
      }
      
      // Clear error sau 3 giây
      if (error) {
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }, 500); // Tăng debounce lên 500ms
    
    setDebounceTimer(timer);
  }, [debounceTimer]);

  // Redirect nếu không có token
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect nếu không có quyền owner
  if (!isOwner) {
    return <Navigate to="/access-denied" replace />;
  }

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-white">
        <div className="bg-red-500 rounded-xl p-4 text-center">
          <p className="text-lg font-semibold">Error: {error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-white text-red-500 rounded-lg hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 text-white">
        <div className="bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-lg">No data available</p>
        </div>
      </div>
    );
  }

  // Tạo stats từ dữ liệu API
  const stats = [
    {
      label: "Doanh thu",
      value: formatCurrency(dashboardData.stats?.totalRevenue || 0),
      icon: <RiCoinLine size={28} />,
      color: "bg-green-500",
    },
    {
      label: "Chương đã bán",
      value: formatNumber(dashboardData.stats?.totalChaptersSold || 0),
      icon: <RiBook2Line size={28} />,
      color: "bg-blue-500",
    },
    {
      label: "Lượt xem",
      value: formatNumber(dashboardData.stats?.totalViews || 0),
      icon: <RiEyeLine size={28} />,
      color: "bg-purple-500",
    },
    {
      label: "Lượt đánh giá",
      value: formatNumber(dashboardData.stats?.totalReviews || 0),
      icon: <RiStarLine size={28} />,
      color: "bg-orange-500",
    },
  ];

  // Chuyển đổi dữ liệu doanh thu theo thể loại
  const pieData = dashboardData.revenueByCategory?.map(item => ({
    name: item.categoryName,
    value: item.revenue
  })) || [];

  const pieColors = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Chuyển đổi dữ liệu bán hàng theo tháng
  // Xử lý dữ liệu để hiển thị đầy đủ các tháng, kể cả những tháng có 0 order
  const processBarData = () => {
    if (!dashboardData.monthlySales || !dateRange.startDate || !dateRange.endDate) {
      return [];
    }

    // Tạo danh sách tất cả tháng trong khoảng thời gian
    const allMonths = [];
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endDateMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    
    while (currentDate <= endDateMonth) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Tìm dữ liệu cho tháng này
      const existingData = dashboardData.monthlySales.find(item => item.month === monthKey);
      
      allMonths.push({
        month: monthKey,
        sales: existingData?.sales || 0
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return allMonths;
  };

  const barData = processBarData();
  

  return (
    <div className="p-6 text-white">
      
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`${stat.color} rounded-xl p-4 flex items-center space-x-3 shadow-lg`}
          >
            <div className="text-white">{stat.icon}</div>
            <div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-90">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Donut chart */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Doanh thu theo thể loại</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [formatCurrency(value), props.payload.name]}
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #6B7280',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart with Date Range Picker */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
            <div>
              <h2 className="text-lg font-semibold">Sách bán theo tháng</h2>
              {dateRange.startDate && dateRange.endDate && (
                <p className="text-sm text-gray-400 mt-1">
                  Từ {new Date(dateRange.startDate).toLocaleDateString('vi-VN')} đến {new Date(dateRange.endDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange.startDate || ''}
                  max={dateRange.endDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                    // Không auto load, chỉ cập nhật state
                  }}
                  onKeyDown={(e) => {
                    // Load khi bấm Enter
                    if (e.key === 'Enter') {
                      handleDateRangeChange(e.target.value, dateRange.endDate);
                    }
                  }}
                  onBlur={() => {
                    // Load khi user click ra ngoài, chỉ khi không có lỗi
                    if (dateRange.startDate && dateRange.endDate && !error) {
                      handleDateRangeChange(dateRange.startDate, dateRange.endDate);
                    }
                  }}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Từ ngày"
                />
                <input
                  type="date"
                  value={dateRange.endDate || ''}
                  min={dateRange.startDate || ''}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                    // Không auto load, chỉ cập nhật state
                  }}
                  onKeyDown={(e) => {
                    // Load khi bấm Enter
                    if (e.key === 'Enter') {
                      handleDateRangeChange(dateRange.startDate, e.target.value);
                    }
                  }}
                  onBlur={() => {
                    // Load khi user click ra ngoài, chỉ khi không có lỗi
                    if (dateRange.startDate && dateRange.endDate && !error) {
                      handleDateRangeChange(dateRange.startDate, dateRange.endDate);
                    }
                  }}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Đến ngày"
                />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 3);
                    handleDateRangeChange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  3T
                </button>
                <button
                  onClick={() => {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 6);
                    handleDateRangeChange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  6T
                </button>
                <button
                  onClick={() => {
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 12);
                    handleDateRangeChange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  12T
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="month" 
                stroke="#ccc" 
                tick={{ fontSize: 12, fill: '#ccc' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#ccc" 
                tick={{ fontSize: 12, fill: '#ccc' }}
                allowDecimals={false}
              />
              <Tooltip 
                formatter={(value, name) => [value, 'Số lượng bán']}
                labelFormatter={(label) => `Tháng: ${label}`}
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #6B7280',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar 
                dataKey="sales" 
                fill="#F97316" 
                radius={[4, 4, 0, 0]}
                stroke="#EA580C"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders & Best Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentOrders orders={dashboardData.recentOrders || []} />
        <BestSellers books={dashboardData.bestSellers || []} />
      </div>
    </div>
  );
}
