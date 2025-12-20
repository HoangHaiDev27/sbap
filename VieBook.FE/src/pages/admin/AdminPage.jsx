import { useEffect, useState } from "react";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,} from "recharts";
import {RiBookLine,RiHeadphoneLine,RiUserStarLine,RiUserLine,RiAdminLine,RiExchangeLine,RiThumbUpLine,} from "react-icons/ri";
import { getStatistic } from "../../api/adminApi";

export default function AdminPage() {
  const [statsData, setStatsData] = useState([]);
  const [booksByMonthData, setBooksByMonthData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  

  const RiDongIcon = () => (
    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg">
      đ
    </div>
  );
const diffInMonths = (from, to) => {
  if (!from || !to) return 0;

  const start = new Date(from);
  const end = new Date(to);

  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const maxRangeMonths = 12;

    if (fromDate && toDate && diffInMonths(fromDate, toDate) > maxRangeMonths) {
      setError("Vui lòng chọn khoảng thời gian không quá 12 tháng");
      setStats(null);
      setStatsData([]);
      setBooksByMonthData([]);
      setRevenueData([]);
      setCategoryDistribution([]);
      setLoading(false);
      return; // ⛔ DỪNG, KHÔNG GỌI API
    }
      try {
        const res = await getStatistic(fromDate, toDate);
        const data = res.data ?? res;

        // Nếu API trả về message, hiển thị và dừng
        if (data.message) {
          setError(data.message);
          setStats(null);
          setStatsData([]);
          setBooksByMonthData([]);
          setRevenueData([]);
          setCategoryDistribution([]);
          setLoading(false);
          return;
        }

        setStats(data);

        const safePercent = (val) => (val == null || val < 0 || isNaN(val) ? 0 : val);

        setStatsData([
          {
            title: "Tổng số sách",
            value: data.totalBooks ?? 0,
            change: `${safePercent(data.booksChangePercent)}%`,
            icon: <RiBookLine size={28} className="text-white" />,
            color: "bg-blue-500",
            link: "/staff/books",
          },
          {
            title: "Sách nói",
            value: data.audioBooks ?? 0,
            change: `${safePercent(data.audioChangePercent)}%`,
            icon: <RiHeadphoneLine size={28} className="text-white" />,
            color: "bg-purple-500",
            link: "/staff/books",
          },
          {
            title: "Chủ sở hữu sách",
            value: data.bookOwners ?? 0,
            change: `${safePercent(data.bookOwnerChangePercent)}%`,
            icon: <RiUserStarLine size={28} className="text-white" />,
            color: "bg-green-500",
            link: "/staff/book-owners",
          },
          {
            title: "Khách hàng",
            value: data.customers ?? 0,
            change: `${safePercent(data.customerChangePercent)}%`,
            icon: <RiUserLine size={28} className="text-white" />,
            color: "bg-orange-500",
            link: "/staff/customers",
          },
          {
            title: "Nhân viên",
            value: data.staffs ?? 0,
            change: `${safePercent(data.staffChangePercent)}%`,
            icon: <RiAdminLine size={28} className="text-white" />,
            color: "bg-red-500",
            link: "/admin/staff",
          },
          {
            title: "Tổng Giao dịch",
            value: data.monthlyTransactions ?? 0,
            change: `${safePercent(data.transactionChangePercent)}%`,
            icon: <RiExchangeLine size={28} className="text-white" />,
            color: "bg-cyan-500",
            link: "/staff/transactions",
          },
          {
            title: "Tổng Doanh thu(VNĐ)",
            value: `${data.monthlyRevenue?.toLocaleString() ?? "0"}`,
            change: `${safePercent(data.revenueChangePercent)}%`,
            icon: <RiDongIcon size={28} className="text-white" />,
            color: "bg-amber-500",
            link: "/staff/transactions",
          },
          {
            title: "Phản hồi tích cực",
            value: `${safePercent(data.positiveFeedbackPercent)}%`,
            change: `${safePercent(data.feedbackChangePercent)}%`,
            icon: <RiThumbUpLine size={28} className="text-white" />,
            color: "bg-pink-500",
            link: "/staff/feedback",
          },
        ]);

        setBooksByMonthData(data.booksByMonthData ?? []);
        setRevenueData(data.revenueData ?? []);
        setCategoryDistribution(data.categoryDistribution ?? []);
      } catch (err) {
        console.error("❌ Lỗi khi tải thống kê:", err);
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch khi load trang hoặc có ngày nào được chọn
    fetchData();
  }, [fromDate, toDate]);

  const displayedCategories = showAllCategories
    ? categoryDistribution
    : categoryDistribution.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-20 sm:pt-24">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                Tổng quan thống kê
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Bảng điều khiển quản trị hệ thống</p>
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <label htmlFor="from" className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Từ ngày:
                </label>
                <input
                  id="from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                <label htmlFor="to" className="text-sm text-gray-700 font-medium whitespace-nowrap">
                  Đến ngày:
                </label>
                <input
                  id="to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Loading & Error */}
          {loading && <div className="p-8 sm:p-10 text-center text-gray-600 text-sm sm:text-base">Đang tải dữ liệu...</div>}
          {error && <div className="p-8 sm:p-10 text-center text-red-500 text-sm sm:text-base">{error}</div>}

          {/* Nếu có error thì không hiển thị phần dữ liệu */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {statsData.map((stat, index) => (
                <a
                  key={index}
                  href={stat.link ?? "#"}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 break-words">{stat.value}</p>
                      <p
                        className={`text-xs sm:text-sm mt-1 ${
                          parseFloat(stat.change) >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {parseFloat(stat.change) >= 0 ? "+" : ""}
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0 ml-3`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </a>
              ))}
            </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Books by Day */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Sách mới</h3>
                  <div className="h-64 sm:h-72 flex items-center justify-center overflow-x-auto">
                    {booksByMonthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={booksByMonthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                            wrapperStyle={{ outline: 'none' }}
                          />
                          <Bar dataKey="books" name="Tổng số sách" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm sm:text-base text-gray-500">Không có dữ liệu</p>
                    )}
                  </div>
                </div>

                {/* Revenue Chart */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Doanh thu</h3>
                <div className="h-64 sm:h-72 flex items-center justify-center overflow-x-auto">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          width={60}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            if (value >= 1_000_000) return Math.round(value / 1_000_000) + " triệu";
                            if (value >= 1_000) return Math.round(value / 1_000) + "nghìn";
                            return value;
                          }}
                          domain={[0, 'dataMax + dataMax*0.1']}
                        />
                        <Tooltip
                          formatter={(value) => `${value.toLocaleString()} vnđ`}
                          labelFormatter={(label) => `Tháng ${label}`}
                          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                          wrapperStyle={{ outline: 'none' }}
                        />
                        <Bar dataKey="revenue" name="Tổng" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-500">Không có dữ liệu</p>
                  )}
                </div>
              </div>
              </div>

              {/* Category & Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Phân loại sách</h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Tổng: {categoryDistribution.length} loại
                    </span>
                  </div>

                  {categoryDistribution.length > 0 ? (
                    <>
                      <div className="space-y-3 sm:space-y-4">
                        {displayedCategories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                              <div
                                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: `hsl(${index * 72}, 70%, 50%)` }}
                              ></div>
                              <span className="text-sm sm:text-base text-gray-900 truncate">{category.name}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm sm:text-base text-gray-900 font-medium">{category.count}</div>
                              <div className="text-xs sm:text-sm text-gray-500">{category.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {categoryDistribution.length > 5 && (
                        <button
                          onClick={() => setShowAllCategories(!showAllCategories)}
                          className="mt-4 w-full sm:w-auto px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-colors min-h-[44px]"
                        >
                          {showAllCategories ? "Thu gọn ▲" : "Xem thêm ▼"}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm sm:text-base text-gray-500">Không có dữ liệu</p>
                  )}
                </div>

                {/* Feedback */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Phản hồi người dùng</h3>
                  <div className="space-y-4">
                    {stats ? (
                      (() => {
                        //const hasFeedback = stats?.averageRating > 0;
                        const positive = stats?.positiveFeedbackPercent ?? 0;
                        const negative = stats?.negativeFeedbackPercent ?? 0; 

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-sm sm:text-base text-gray-600">Phản hồi tích cực</span>
                              <span className="text-sm sm:text-base text-green-600 font-semibold">{positive}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                              <div
                                className="bg-green-500 h-2.5 sm:h-3 rounded-full transition-all duration-300"
                                style={{ width: `${positive}%` }}
                              ></div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm sm:text-base text-gray-600">Phản hồi tiêu cực</span>
                              <span className="text-sm sm:text-base text-red-600 font-semibold">{negative}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                              <div
                                className="bg-red-500 h-2.5 sm:h-3 rounded-full transition-all duration-300"
                                style={{ width: `${negative}%` }}
                              ></div>
                            </div>

                            <div className="mt-4 p-4 sm:p-5 bg-green-50 rounded-lg text-center">
                              <div className="text-xl sm:text-2xl font-bold text-green-700">
                                {stats?.averageRating ?? 0}/5.0
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 mt-1">Đánh giá trung bình</div>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-sm sm:text-base text-gray-500 text-center">Chưa có dữ liệu phản hồi</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
