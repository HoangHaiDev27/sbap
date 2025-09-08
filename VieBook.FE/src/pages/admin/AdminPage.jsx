// src/pages/admin/AdminPage.jsx
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminPage() {
  const [timeFilter, setTimeFilter] = useState("month");

  const statsData = [
    { title: "Tổng số sách", value: "2,456", change: "+18%", icon: "ri-book-line", color: "bg-blue-500" },
    { title: "Sách nói", value: "1,823", change: "+12%", icon: "ri-headphone-line", color: "bg-purple-500" },
    { title: "Chủ sở hữu sách", value: "156", change: "+8%", icon: "ri-user-star-line", color: "bg-green-500" },
    { title: "Khách hàng", value: "8,924", change: "+25%", icon: "ri-user-line", color: "bg-orange-500" },
    { title: "Nhân viên", value: "12", change: "+2", icon: "ri-admin-line", color: "bg-red-500" },
    { title: "Giao dịch trong tháng", value: "3,421", change: "+15%", icon: "ri-exchange-line", color: "bg-cyan-500" },
    { title: "Doanh thu tháng", value: "$284K", change: "+22%", icon: "ri-money-dollar-circle-line", color: "bg-emerald-500" },
    { title: "Phản hồi tích cực", value: "89%", change: "+3%", icon: "ri-thumb-up-line", color: "bg-pink-500" },
  ];

  const booksByDayData = [
    { date: "01/01", books: 12 },
    { date: "02/01", books: 18 },
    { date: "03/01", books: 15 },
    { date: "04/01", books: 22 },
    { date: "05/01", books: 28 },
    { date: "06/01", books: 25 },
    { date: "07/01", books: 35 },
  ];

  const revenueData = [
    { month: "Th1", revenue: 120 },
    { month: "Th2", revenue: 150 },
    { month: "Th3", revenue: 180 },
    { month: "Th4", revenue: 200 },
    { month: "Th5", revenue: 240 },
    { month: "Th6", revenue: 284 },
  ];

  const categoryDistribution = [
    { name: "Khoa học", count: 456, percentage: 28 },
    { name: "Kỹ năng sống", count: 389, percentage: 24 },
    { name: "Kinh doanh", count: 312, percentage: 19 },
    { name: "Tâm lý", count: 245, percentage: 15 },
    { name: "Khác", count: 232, percentage: 14 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tổng quan thống kê
              </h2>
              <p className="text-gray-600">Bảng điều khiển quản trị hệ thống</p>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <label htmlFor="from" className="text-sm text-gray-600">
                        Từ ngày:
                    </label>
                    <input
                    id="from"
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg 
                                bg-white text-gray-900 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <label htmlFor="to" className="text-sm text-gray-600">
                        Đến ngày:
                    </label>
                    <input
                    id="to"
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-lg 
                                bg-white text-gray-900 
                                focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <i
                      className={`${stat.icon} text-white text-xl w-6 h-6 flex items-center justify-center`}
                    ></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sách mới theo ngày
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={booksByDayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="books" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Doanh thu theo tháng
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category + Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Phân loại sách
              </h3>
              <div className="space-y-4">
                {categoryDistribution.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full`}
                        style={{
                          backgroundColor: `hsl(${index * 72}, 70%, 50%)`,
                        }}
                      ></div>
                      <span className="text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-medium">
                        {category.count}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Phản hồi người dùng
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phản hồi tích cực</span>
                  <span className="text-green-600 font-semibold">89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: "89%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phản hồi tiêu cực</span>
                  <span className="text-red-600 font-semibold">11%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: "11%" }}
                  ></div>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    4.6/5.0
                  </div>
                  <div className="text-sm text-gray-600">Đánh giá trung bình</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
