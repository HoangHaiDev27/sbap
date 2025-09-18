import React, { useState, useRef, useEffect } from "react";
import { 
  RiNotification3Line, 
  RiCheckLine, 
  RiCloseLine,
  RiWallet3Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiBookOpenLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiUserFollowLine,
  RiChat3Line,
  RiHeartLine,
  RiMegaphoneLine,
  RiGiftLine,
  RiNotificationLine
} from "react-icons/ri";
import { useNotificationStore } from "../../hooks/stores/notificationStore";

function UserNotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const notifRef = useRef(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    initializeNotifications
  } = useNotificationStore();

  // Initialize notifications for user ID 4
  useEffect(() => {
    console.log("Initializing notifications for user 4");
    
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      initializeNotifications(4);
    }, 100);
    
    // Set up polling for unread count every 30 seconds
    const interval = setInterval(() => {
      console.log("Polling unread count...");
      fetchUnreadCount(4);
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [initializeNotifications, fetchUnreadCount]);

  // Debug unreadCount changes
  useEffect(() => {
    console.log("Unread count changed:", unreadCount, "type:", typeof unreadCount, "isNumber:", !isNaN(unreadCount));
  }, [unreadCount]);

  // 🔹 Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(4);
      setShowAll(false); // Reset showAll when opening
    }
  }, [isOpen, fetchNotifications]);

  // Auto mark as read when closing menu
  useEffect(() => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead(4);
    }
  }, [isOpen, unreadCount, markAllAsRead]);

  const getNotificationIcon = (type) => {
    const iconClass = "w-5 h-5 text-blue-400";
    
    switch (type) {
      case "WALLET_RECHARGE":
        return <RiWallet3Line className={iconClass} />;
      case "PAYMENT_SUCCESS":
        return <RiCheckboxCircleLine className={`${iconClass} text-green-400`} />;
      case "PAYMENT_FAILED":
        return <RiCloseCircleLine className={`${iconClass} text-red-400`} />;
      case "BOOK_PURCHASE":
        return <RiBookOpenLine className={iconClass} />;
      case "BOOK_APPROVAL":
        return <RiThumbUpLine className={`${iconClass} text-green-400`} />;
      case "BOOK_REJECTED":
        return <RiThumbDownLine className={`${iconClass} text-red-400`} />;
      case "NEW_FOLLOWER":
        return <RiUserFollowLine className={iconClass} />;
      case "NEW_COMMENT":
        return <RiChat3Line className={iconClass} />;
      case "NEW_LIKE":
        return <RiHeartLine className={`${iconClass} text-red-400`} />;
      case "SYSTEM_ANNOUNCEMENT":
        return <RiMegaphoneLine className={`${iconClass} text-yellow-400`} />;
      case "PROMOTION":
        return <RiGiftLine className={`${iconClass} text-purple-400`} />;
      default:
        return <RiNotificationLine className={iconClass} />;
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        return "Thời gian không xác định";
      }
      
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 0) return "Vừa xong";
      if (diffInSeconds < 60) return "Vừa xong";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
      
      // Hiển thị ngày tháng cho các thông báo cũ hơn với timezone Việt Nam
      return date.toLocaleDateString("vi-VN", {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return "Thời gian không xác định";
    }
  };

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  // Get notifications to display based on showAll state
  const getDisplayNotifications = () => {
    if (showAll) {
      return notifications.slice(0, 10); // Show first 10 when "show more"
    }
    return notifications.slice(0, 5); // Show first 5 by default
  };

  const displayNotifications = getDisplayNotifications();
  const hasMoreNotifications = notifications.length > 5;

  return (
    <div className="relative" ref={notifRef}>
      {/* Icon chuông */}
      <button
        className="relative hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
        onClick={() => setIsOpen((v) => !v)}
      >
        <RiNotification3Line className="text-2xl text-white" />
        {console.log("Rendering badge with unreadCount:", unreadCount, "type:", typeof unreadCount)}
        {Number(unreadCount) > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-lg border-2 border-white">
            {Number(unreadCount) > 99 ? "99+" : Number(unreadCount)}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 text-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-slate-600 font-semibold">
            <span>Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                <p className="mt-2 text-sm">Đang tải...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-400">
                <p className="text-sm">Lỗi: {error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <RiNotification3Line className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-slate-700">
                  {displayNotifications.map((notification) => (
                    <li
                      key={notification.notificationId}
                      className={`px-4 py-3 hover:bg-slate-700 transition-colors ${
                        !notification.isRead ? "bg-blue-900/20 border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                          </div>
                          {notification.body && (
                            <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                              {notification.body}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Show More/Less Button */}
                {hasMoreNotifications && (
                  <div className="p-3 border-t border-slate-600">
                    {!showAll ? (
                      <button
                        onClick={handleShowMore}
                        className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2 hover:bg-slate-700 rounded transition-colors"
                      >
                        Xem thêm ({notifications.length - 5} thông báo khác)
                      </button>
                    ) : (
                      <button
                        onClick={handleShowLess}
                        className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2 hover:bg-slate-700 rounded transition-colors"
                      >
                        Thu gọn
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserNotificationMenu;
