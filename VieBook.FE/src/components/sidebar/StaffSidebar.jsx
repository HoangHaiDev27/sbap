'use client';
import { Link, useLocation } from 'react-router-dom';

export default function StaffSidebar() {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'ri-dashboard-line', href: '/staff' },
    { id: 'categories', label: 'Quản lý Thể loại', icon: 'ri-bookmark-line', href: '/staff/categories' },
    { id: 'books', label: 'Quản lý Sách', icon: 'ri-book-2-line', href: '/staff/books' },
    { id: 'book-owners', label: 'Quản lý Book Owner', icon: 'ri-user-star-line', href: '/staff/book-owners' },
    { id: 'customers', label: 'Quản lý Customer', icon: 'ri-user-line', href: '/staff/customers' },
    { id: 'pending-books', label: 'Duyệt sách mới', icon: 'ri-file-check-line', href: '/staff/pending-books' },
    { id: 'transactions', label: 'Giao dịch', icon: 'ri-money-dollar-circle-line', href: '/staff/transactions' },
    { id: 'withdrawals', label: 'Phê duyệt rút tiền', icon: 'ri-bank-card-line', href: '/staff/withdrawals' },
    { id: 'feedback', label: 'Feedback', icon: 'ri-message-2-line', href: '/staff/feedback' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white overflow-y-auto z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
        <span className="text-xl font-bold font-['Pacifico']">VieBook</span>
      </div>

      {/* Menu */}
      <nav className="px-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`${item.icon} w-5 h-5 flex items-center justify-center`}></i>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <Link
          to="/"
          className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer text-center"
        >
          <i className="ri-arrow-left-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
