import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import { toast } from "react-toastify";
import {
  RiMenuLine,
  RiNotificationLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiUserFollowLine,
} from "react-icons/ri";
import { useNotificationStore } from "../../hooks/stores/notificationStore";

export default function AdminHeader({ onToggleSidebar }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount } = useNotificationStore();

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
        {/* Thông báo */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-gray-900 text-white rounded-lg cursor-pointer relative"
          >
            <RiNotificationLine className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown danh sách thông báo */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500 px-4 py-2">
                  Không có thông báo
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.notificationId || n.id}
                    className="px-4 py-2 text-sm border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {n.title || "Thông báo"}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {n.createdAt
                              ? formatTimeAgo(n.createdAt)
                              : "Không xác định"}
                          </span>
                        </div>
                        {n.body && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                            {n.body}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Menu User */}
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
              <Link
                to="/admin/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="ri-settings-3-line mr-2" />
                Cài đặt
              </Link>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
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
