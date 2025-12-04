'use client';
import { useState, useEffect, useRef } from 'react';
import { RiMenuLine, RiUserLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/authApi';
import { getCurrentUser } from '../../api/userApi';

export default function StaffHeader({ onToggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [staffAvatar, setStaffAvatar] = useState(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Load staff data on component mount
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const staffData = await getCurrentUser();
        console.log("StaffHeader - Loaded staff data:", staffData);
        setCurrentStaff(staffData);
        const avatarUrl = staffData?.userProfile?.avatarUrl;
        setStaffAvatar(avatarUrl);
        // Reset showAvatar khi có avatar mới
        if (avatarUrl) {
          setShowAvatar(true);
        }
      } catch (error) {
        console.error("StaffHeader - Error loading staff data:", error);
        // Fallback to localStorage data
        const localStaff = JSON.parse(localStorage.getItem("auth_user") || "null");
        setCurrentStaff(localStaff);
        const avatarUrl = localStaff?.userProfile?.avatarUrl;
        setStaffAvatar(avatarUrl);
        if (avatarUrl) {
          setShowAvatar(true);
        }
      }
    };
    
    loadStaffData();
  }, []);

  // Reset showAvatar khi staff thay đổi
  useEffect(() => {
    setShowAvatar(true);
  }, [currentStaff]);

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
        {/* <button className="p-2 text-gray-200 hover:bg-slate-800 rounded-lg cursor-pointer relative">
          <i className="ri-notification-3-line w-5 h-5 flex items-center justify-center"></i>
          <span className="absolute top-1 right-1 inline-flex h-2 w-2 bg-red-500 rounded-full"></span>
        </button> */}

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            {staffAvatar && showAvatar ? (
              <img
                src={staffAvatar}
                alt="Staff Avatar"
                className="h-9 w-9 rounded-full object-cover border border-gray-600 hover:border-blue-400 transition-colors"
                onError={(e) => {
                  // Nếu ảnh lỗi, chuyển sang hiển thị icon
                  console.log("StaffHeader - Avatar image failed to load, switching to icon");
                  setShowAvatar(false);
                  // Ẩn ảnh lỗi ngay lập tức
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("StaffHeader - Avatar image loaded successfully");
                }}
              />
            ) : null}
            {/* Icon luôn hiển thị khi không có avatar hoặc avatar lỗi */}
            {(!staffAvatar || !showAvatar) && (
              <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center">
                <RiUserLine className="text-white text-lg" />
              </div>
            )}
            <span className="text-white font-medium">
              {currentStaff?.userProfile?.fullName || 'Nhân viên'}
            </span>
            <i className="ri-arrow-down-s-line text-gray-400"></i>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* <div className="px-4 py-2 text-sm text-gray-500 border-b">
                {currentStaff?.email || 'staff@viebook.com'}
              </div> */}
              {/* <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">
                <i className="ri-settings-3-line mr-2 text-gray-600"></i>
                <span className="text-gray-800">Cài đặt</span>
              </button> */}
              {/* <hr className="my-1" /> */}
              <button onClick={async ()=>{ await logout(); navigate('/auth'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 cursor-pointer">
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
