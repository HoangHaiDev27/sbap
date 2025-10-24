import React, { useState, useRef, useEffect } from "react";
import { RiUserLine, RiAddLine, RiCoinLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { useCoinsStore } from "../../hooks/stores/coinStore";
import { logout, getCurrentRole } from "../../api/authApi";
import { getCurrentUser } from "../../api/userApi";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  
  // Debug logging
  console.log("UserMenu - Current user:", currentUser);
  console.log("UserMenu - User avatar:", userAvatar);
  console.log("UserMenu - Show avatar:", showAvatar);
  
  // Lấy role hiện tại
  const userRole = getCurrentRole();
  const isOwner = userRole && userRole.toLowerCase() === 'owner';

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý đăng xuất
  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };
  // Lấy số đồng xu hiện tại
  const coins = useCoinsStore((state) => state.coins);
  
  // Debug logging
  console.log("UserMenu - Current coins:", coins);
  
  // Theo dõi thay đổi coins
  useEffect(() => {
    console.log("UserMenu - Coins changed to:", coins);
  }, [coins]);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser();
        console.log("UserMenu - Loaded user data:", userData);
        setCurrentUser(userData);
        const avatarUrl = userData?.userProfile?.avatarUrl;
        setUserAvatar(avatarUrl);
        // Reset showAvatar khi có avatar mới
        if (avatarUrl) {
          setShowAvatar(true);
        }
      } catch (error) {
        console.error("UserMenu - Error loading user data:", error);
        // Fallback to localStorage data
        const localUser = JSON.parse(localStorage.getItem("auth_user") || "null");
        setCurrentUser(localUser);
        const avatarUrl = localUser?.userProfile?.avatarUrl;
        setUserAvatar(avatarUrl);
        if (avatarUrl) {
          setShowAvatar(true);
        }
      }
    };
    
    loadUserData();
  }, []);

  // Reset showAvatar khi user thay đổi
  useEffect(() => {
    setShowAvatar(true);
  }, [currentUser]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar hoặc Icon user */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center hover:text-blue-400 transition-colors cursor-pointer"
      >
        {userAvatar && showAvatar ? (
          <img
            src={userAvatar}
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-600 hover:border-blue-400 transition-colors"
            onError={(e) => {
              // Nếu ảnh lỗi, chuyển sang hiển thị icon
              console.log("UserMenu - Avatar image failed to load, switching to icon");
              setShowAvatar(false);
              // Ẩn ảnh lỗi ngay lập tức
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              console.log("UserMenu - Avatar image loaded successfully");
            }}
          />
        ) : null}
        {/* Icon luôn hiển thị khi không có avatar hoặc avatar lỗi */}
        {(!userAvatar || !showAvatar) && (
          <RiUserLine className="text-xl text-white" />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 bg-slate-800 text-white shadow-lg rounded-md border border-slate-700 z-50
                     transform transition-all duration-200 scale-95 opacity-0 animate-fadeIn"
        >
          {/* Đồng xu */}
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RiCoinLine className="text-yellow-400 w-5 h-5" />
                <span className="text-sm font-medium text-yellow-400">
                  {coins ? parseFloat(coins.toFixed(1)).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0} xu
                </span>
              </div>
              <button 
                onClick={() => {
                  navigate("/recharge");
                  setOpen(false);
                }}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <RiAddLine className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <Link
            to="/customer"
            className="block px-4 py-2 hover:bg-slate-700 transition-colors"
            onClick={() => setOpen(false)}
          >
            Thông tin tài khoản
          </Link>
          {/* Chỉ hiển thị các link owner khi user có role owner */}
          {isOwner && (
            <>
              <Link
                to="/owner/dashboard"
                className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                Cửa hàng của tôi
              </Link>
              <Link
                to="/owner/profile/overview"
                className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                Hồ sơ của tôi
              </Link>
              <Link
                to="/owner/profile/settings/personal"
                className="block px-4 py-2 hover:bg-slate-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                Cài đặt
              </Link>
              <Link
                to="/owner/withdraw"
                className="block px-4 py-2 text-green-400 hover:bg-slate-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                💵 Yêu cầu rút tiền
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
