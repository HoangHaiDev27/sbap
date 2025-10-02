'use client';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { switchRole, getCurrentRole, hasRole, canSwitchStaffAdmin } from '../../api/authApi';
import { RiAdminLine, RiUserLine } from 'react-icons/ri';

export default function StaffSidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleSwitch = () => {
    // Chuyển từ staff sang admin
    const success = switchRole('admin');
    if (success) {
      navigate('/admin');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'ri-dashboard-line', href: '/staff' },
    { id: 'categories', label: 'Quản lý Thể loại', icon: 'ri-bookmark-line', href: '/staff/categories' },
    { id: 'books', label: 'Quản lý Sách', icon: 'ri-book-2-line', href: '/staff/books' },
    { id: 'book-owners', label: 'Quản lý chủ sách', icon: 'ri-user-star-line', href: '/staff/book-owners' },
    { id: 'customers', label: 'Quản lý khách hàng', icon: 'ri-user-line', href: '/staff/customers' },
    { id: 'pending-books', label: 'Duyệt sách mới', icon: 'ri-file-check-line', href: '/staff/pending-books' },
    { id: 'transactions', label: 'Giao dịch', icon: 'ri-money-dollar-circle-line', href: '/staff/transactions' },
    { id: 'withdrawals', label: 'Phê duyệt rút tiền', icon: 'ri-bank-card-line', href: '/staff/withdrawals' },
    { id: 'feedback', label: 'Đánh giá', icon: 'ri-message-2-line', href: '/staff/feedback' },
  ];

  return (
    <>
      {/* Overlay cho mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      <aside
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto z-50 shadow-lg transform transition-transform duration-200 lg:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="h-[1.5em] w-auto scale-300" />
            <span className="text-2xl font-bold text-orange-500">VieBook</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="px-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onClick={onClose} // đóng khi click menu trên mobile
                    className={`flex items-center px-3 py-3 rounded-lg transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role Switch Button - chỉ hiển thị khi user có thể chuyển đổi giữa staff và admin - nằm dưới cùng */}
        {canSwitchStaffAdmin() && (
          <div className="px-4 pb-4">
            <div className="border-t border-gray-700 pt-4">
              <button
                onClick={handleRoleSwitch}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded transition-colors"
              >
                <RiAdminLine className="w-4 h-4" />
                <span>Chuyển sang Admin</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
