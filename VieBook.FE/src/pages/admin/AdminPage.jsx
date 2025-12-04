import { useEffect, useState } from "react";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,} from "recharts";
import {RiBookLine,RiHeadphoneLine,RiUserStarLine,RiUserLine,RiAdminLine,RiExchangeLine,RiThumbUpLine,} from "react-icons/ri";
import { getStatistic } from "../../api/adminApi";

export default function AdminPage() {
  const [statsData, setStatsData] = useState([]);
  const [booksByDayData, setBooksByDayData] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getStatistic(fromDate, toDate);
        const data = res.data ?? res;

        // Nếu API trả về message, hiển thị và dừng
        if (data.message) {
          setError(data.message);
          setStats(null);
          setStatsData([]);
          setBooksByDayData([]);
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
            title: "Giao dịch trong tháng",
            value: data.monthlyTransactions ?? 0,
            change: `${safePercent(data.transactionChangePercent)}%`,
            icon: <RiExchangeLine size={28} className="text-white" />,
            color: "bg-cyan-500",
            link: "/staff/transactions",
          },
          {
            title: "Doanh thu tháng (VNĐ)",
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

        setBooksByDayData(data.booksByDayData ?? []);
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
      <main className="pt-20">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tổng quan thống kê
              </h2>
              <p className="text-gray-600">Bảng điều khiển quản trị hệ thống</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="from" className="text-sm text-gray-600 whitespace-nowrap">
                  Từ ngày:
                </label>
                <input
                  id="from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label htmlFor="to" className="text-sm text-gray-600 whitespace-nowrap">
                  Đến ngày:
                </label>
                <input
                  id="to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Loading & Error */}
          {loading && <div className="p-10 text-center text-gray-600">Đang tải dữ liệu...</div>}
          {error && <div className="p-10 text-center text-red-500">{error}</div>}

          {/* Nếu có error thì không hiển thị phần dữ liệu */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat, index) => (
                <a
                  key={index}
                  href={stat.link ?? "#"} // nếu không có link thì không chuyển trang
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p
                        className={`text-sm mt-1 ${
                          parseFloat(stat.change) >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {parseFloat(stat.change) >= 0 ? "+" : ""}
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </a>
              ))}
            </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Books by Day */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sách mới theo ngày</h3>
                  <div className="h-64 flex items-center justify-center">
                    {booksByDayData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={booksByDayData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="books" name="Tổng số sách" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500">Không có dữ liệu</p>
                    )}
                  </div>
                </div>

                {/* Revenue Chart */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
                <div className="h-64 flex items-center justify-center">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          width={70}
                          tickFormatter={(value) => {
                            if (value >= 1_000_000) return Math.round(value / 1_000_000) + " triệu";
                            if (value >= 1_000) return Math.round(value / 1_000) + "k";
                            return value;
                          }}
                          domain={[0, 'dataMax + dataMax*0.1']}
                        />
                        <Tooltip
                          formatter={(value) => `${value.toLocaleString()} vnđ`}
                          labelFormatter={(label) => `Tháng ${label}`}
                        />
                        <Bar dataKey="revenue" name="Tổng" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">Không có dữ liệu</p>
                  )}
                </div>
              </div>
              </div>

              {/* Category & Feedback */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Phân loại sách</h3>
                    <span className="text-sm text-gray-500">
                      Tổng: {categoryDistribution.length} loại
                    </span>
                  </div>

                  {categoryDistribution.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {displayedCategories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: `hsl(${index * 72}, 70%, 50%)` }}
                              ></div>
                              <span className="text-gray-900">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 font-medium">{category.count}</div>
                              <div className="text-sm text-gray-500">{category.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {categoryDistribution.length > 5 && (
                        <button
                          onClick={() => setShowAllCategories(!showAllCategories)}
                          className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                        >
                          {showAllCategories ? "Thu gọn ▲" : "Xem thêm ▼"}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Không có dữ liệu</p>
                  )}
                </div>

                {/* Feedback */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phản hồi người dùng</h3>
                  <div className="space-y-4">
                    {stats ? (
                      (() => {
                        const hasFeedback =
                          stats?.averageRating > 0 && stats?.positiveFeedbackPercent >= 0;
                        const positive = hasFeedback ? stats.positiveFeedbackPercent : 0;
                        const negative = hasFeedback ? 100 - positive : 0;

                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Phản hồi tích cực</span>
                              <span className="text-green-600 font-semibold">{positive}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-green-500 h-3 rounded-full"
                                style={{ width: `${positive}%` }}
                              ></div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Phản hồi tiêu cực</span>
                              <span className="text-red-600 font-semibold">{negative}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-red-500 h-3 rounded-full"
                                style={{ width: `${negative}%` }}
                              ></div>
                            </div>

                            <div className="mt-4 p-4 bg-green-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-green-700">
                                {stats?.averageRating ?? 0}/5.0
                              </div>
                              <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-gray-500 text-center">Chưa có dữ liệu phản hồi</p>
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
