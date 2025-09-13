'use client';
import { useState, useEffect, useRef } from 'react';
import { RiMenuLine } from 'react-icons/ri';

export default function StaffHeader({ onToggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 bg-slate-900 border-b border-gray-800 h-20 flex items-center justify-between px-4 lg:px-6 z-30">
      {/* Nút menu mobile */}
      <button
        className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-200 hover:bg-slate-800 rounded-md"
        onClick={onToggleSidebar}
      >
        <RiMenuLine className="text-2xl" />
      </button>

      {/* Logo + Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-semibold text-white">
          Trang quản lí của nhân viên
        </h1>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-200 hover:bg-slate-800 rounded-lg cursor-pointer relative">
          <i className="ri-notification-3-line w-5 h-5 flex items-center justify-center"></i>
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <img
              className="h-9 w-9 rounded-full object-cover"
              src="https://api.dicebear.com/7.x/initials/svg?seed=Staff"
              alt="Staff Avatar"
            />
            <span className="text-white font-medium">Nhân viên</span>
            <i className="ri-arrow-down-s-line text-gray-400"></i>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 text-sm text-gray-500 border-b">
                staff@viebook.com
              </div>
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i className="ri-settings-3-line mr-2 text-gray-600"></i>
                <span className="text-gray-800">Cài đặt</span>
              </button>
              <hr className="my-1" />
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer">
                <i className="ri-logout-box-line mr-2"></i>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
