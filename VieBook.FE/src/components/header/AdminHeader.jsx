import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import { getCurrentUser } from "../../api/userApi";
import { toast } from "react-toastify";
import {
  RiMenuLine,
  RiNotificationLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiUserFollowLine,
  RiUserLine,
} from "react-icons/ri";
import { useNotificationStore } from "../../hooks/stores/notificationStore";
import { useAdminStore } from "../../hooks/stores/useAdminStore"; 

export default function AdminHeader({ onToggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotificationStore();
  
  // Get admin data from store
  const { admin, fetchAdmin } = useAdminStore();
  const adminAvatar = admin?.avatarUrl || null;
  const currentAdmin = admin;

  // Load admin data on component mount
  useEffect(() => {
    const loadAdminData = async () => {
      const authUserStr = localStorage.getItem("auth_user");
      if (!authUserStr) return;

      try {
        const authUser = JSON.parse(authUserStr);
        const adminId = authUser.userId;
        
        if (adminId) {
          await fetchAdmin(adminId);
        }
      } catch (error) {
        console.error("AdminHeader - Error parsing auth user:", error);
      }
    };
    
    loadAdminData();
  }, [fetchAdmin]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      console.log("AdminHeader - Profile updated:", event.detail);
      // Reset showAvatar to show new avatar
      setShowAvatar(true);
    };

    window.addEventListener("admin:profile:updated", handleProfileUpdate);
    return () => window.removeEventListener("admin:profile:updated", handleProfileUpdate);
  }, []);

  // Reset showAvatar khi admin thay đổi
  useEffect(() => {
    setShowAvatar(true);
  }, [admin]);
  // Đóng menu/dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/auth");
    } catch {
      toast.error("Đăng xuất thất bại");
    }
  };

  // Icon thông báo theo loại
  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "STAFF_CREATED":
        return <RiUserFollowLine className="w-5 h-5 text-green-400" />;
      case "STAFF_UPDATED":
        return <RiCheckboxCircleLine className="w-5 h-5 text-blue-400" />;
      case "STAFF_DELETED":
        return <RiCloseCircleLine className="w-5 h-5 text-red-400" />;
      default:
        return <RiNotificationLine className={`${iconClass} text-gray-400`} />;
    }
  };

  // Format thời gian (hiển thị "Vừa xong", "x phút trước",...)
  const formatTimeAgo = (dateString) => {
    try {
      if (!dateString) return "Không xác định";

      // Chuẩn hóa định dạng ngày
      const normalizedDateString = dateString.includes("T")
        ? dateString
        : dateString.replace(" ", "T");

      const date = new Date(normalizedDateString);
      if (isNaN(date.getTime())) return "Không xác định";

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Không xác định";
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 bg-gray-900 border-b border-gray-200 h-20 flex items-center justify-between px-4 lg:px-6 z-30">
      {/* Nút menu trên mobile */}
      <button
        className="lg:hidden w-10 h-10 flex items-center justify-center text-white hover:bg-gray-800 rounded-md"
        onClick={onToggleSidebar}
      >
        <RiMenuLine className="text-2xl" />
      </button>

      {/* Tiêu đề */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-white">
          Trang quản lý của quản trị viên
        </h1>
      </div>

      {/* Khu vực bên phải */}
      <div className="flex items-center space-x-4">
        {/* Menu User */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 bg-gray-900 text-white rounded-lg cursor-pointer"
          >
            {adminAvatar && showAvatar ? (
              <img
                src={adminAvatar}
                alt="Admin Avatar"
                className="h-8 w-8 rounded-full object-cover border border-gray-600 hover:border-blue-400 transition-colors"
                onError={(e) => {
                  // Nếu ảnh lỗi, chuyển sang hiển thị icon
                  console.log("AdminHeader - Avatar image failed to load, switching to icon");
                  setShowAvatar(false);
                  // Ẩn ảnh lỗi ngay lập tức
                  e.target.style.display = 'none';
                }}
                onLoad={() => {
                  console.log("AdminHeader - Avatar image loaded successfully");
                }}
              />
            ) : null}
            {/* Icon luôn hiển thị khi không có avatar hoặc avatar lỗi */}
            {(!adminAvatar || !showAvatar) && (
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                <RiUserLine className="text-white text-sm" />
              </div>
            )}
            <span className="font-medium">
              {currentAdmin?.fullName || 'Admin'}
            </span>
            <i className="ri-arrow-down-s-line w-4 h-4 text-white"></i>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <Link
                to="/admin/profile"
                onClick={() => setShowUserMenu(false)} // 👈 tự đóng popup
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="ri-user-line mr-2" />
                Thông tin cá nhân
              </Link>
              {/* <Link
                to="/admin/settings"
                onClick={() => setShowUserMenu(false)} // 👈 tự đóng popup
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="ri-settings-3-line mr-2" />
                Cài đặt
              </Link> */}
              <hr className="my-1" />
              <button
                onClick={() => {
                  setShowUserMenu(false); // 👈 tự đóng popup
                  handleLogout();
                }}
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
