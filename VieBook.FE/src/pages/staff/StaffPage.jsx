'use client';
import { useState } from 'react';

export default function StaffPage() {
  const statsData = [
    { title: 'Tổng số sách', value: '1,234', change: '+12%', icon: 'ri-book-line', color: 'bg-blue-500' },
    { title: 'Book Owner', value: '89', change: '+5%', icon: 'ri-user-star-line', color: 'bg-green-500' },
    { title: 'Customer', value: '2,456', change: '+18%', icon: 'ri-user-line', color: 'bg-purple-500' },
    { title: 'Sách chờ duyệt', value: '23', change: '+3', icon: 'ri-file-check-line', color: 'bg-orange-500' },
  ];

  const pendingBooks = [
    { id: 1, title: 'Sapiens: Lược sử loài người', author: 'Yuval Noah Harari', owner: 'Nguyễn Văn A', date: '2024-01-15', category: 'Khoa học' },
    { id: 2, title: 'Đắc nhân tâm', author: 'Dale Carnegie', owner: 'Trần Thị B', date: '2024-01-14', category: 'Kỹ năng sống' },
    { id: 3, title: 'Atomic Habits', author: 'James Clear', owner: 'Lê Văn C', date: '2024-01-13', category: 'Phát triển bản thân' },
  ];

  const recentTransactions = [
    { id: 1, user: 'Nguyễn Minh D', type: 'Mua sách', amount: '99,000đ', status: 'Thành công', time: '10:30' },
    { id: 2, user: 'Phạm Thị E', type: 'Nâng cấp VIP', amount: '299,000đ', status: 'Thành công', time: '09:45' },
    { id: 3, user: 'Hoàng Văn F', type: 'Mua gói', amount: '199,000đ', status: 'Đang xử lý', time: '09:15' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="pt-24">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tổng quan hệ thống</h2>
            <p className="text-gray-600">Quản lý và theo dõi hoạt động của nền tảng</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <i className={`${stat.icon} text-white text-xl w-6 h-6 flex items-center justify-center`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending books & recent transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending books */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Sách chờ duyệt</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                    Xem tất cả
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pendingBooks.map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{book.title}</h4>
                        <p className="text-sm text-gray-600">Tác giả: {book.author}</p>
                        <p className="text-sm text-gray-500">Chủ sách: {book.owner}</p>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                          {book.category}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 cursor-pointer whitespace-nowrap">
                          Duyệt
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 cursor-pointer whitespace-nowrap">
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">
                    Xem tất cả
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{transaction.user}</h4>
                        <p className="text-sm text-gray-600">{transaction.type}</p>
                        <p className="text-xs text-gray-500">{transaction.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{transaction.amount}</p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            transaction.status === 'Thành công'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
