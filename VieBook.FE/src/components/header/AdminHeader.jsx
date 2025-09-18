import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import { RiMenuLine } from "react-icons/ri";

export default function AdminHeader({ onToggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Tự động đóng menu nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 lg:left-64 right-0 bg-gray-900 border-b border-gray-200 h-20 flex items-center justify-between px-4 lg:px-6 z-30"
    >
      {/* Nút menu mobile */}
      <button
        className="lg:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-gray-800 rounded-md"
        onClick={onToggleSidebar}
      >
        <RiMenuLine className="text-2xl" />
      </button>

      {/* Logo / Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-white">
          Trang quản lí của quản trị viên
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <button className="p-2 bg-gray-900 text-white rounded-lg cursor-pointer">
          <i className="ri-search-line w-5 h-5 flex items-center justify-center"></i>
        </button>

        {/* Dark Mode */}
        <button className="p-2 bg-gray-900 text-white rounded-lg cursor-pointer">
          <i className="ri-moon-line w-5 h-5 flex items-center justify-center"></i>
        </button>

        {/* Notifications */}
        <button className="p-2 bg-gray-900 text-white rounded-lg cursor-pointer relative">
          <i className="ri-notification-3-line w-5 h-5 flex items-center justify-center"></i>
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 bg-gray-900 text-white rounded-lg cursor-pointer"
          >
            <img
              className="h-8 w-8 rounded-full object-cover object-top"
              src="https://readdy.ai/api/search-image?query=professional%20senior%20asian%20male%20administrator%20portrait%20with%20executive%20background%2C%20formal%20business%20attire&width=80&height=80&seq=adminuser&orientation=squarish"
              alt="Admin"
            />
            <span className="font-medium">Admin</span>
            <i className="ri-arrow-down-s-line w-4 h-4 text-white"></i>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <Link
                to="/admin/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="ri-user-line mr-2" />
                Thông tin cá nhân
              </Link>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-settings-3-line mr-2" />
                Cài đặt
              </a>
              <hr className="my-1" />
              <button
                onClick={async () => { await logout(); navigate('/auth'); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <i className="ri-logout-box-line mr-2" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
