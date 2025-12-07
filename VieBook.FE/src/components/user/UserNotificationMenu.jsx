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
import { useCurrentUser } from "../../hooks/useCurrentUser";
import chatWebSocket from "../../services/chatWebSocket";

function UserNotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notifRef = useRef(null);

  const { userId, isAuthenticated } = useCurrentUser();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    initializeNotifications,
    addNotification
  } = useNotificationStore();

  // Initialize notifications for current user
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      console.log("User not authenticated, skipping notification initialization");
      return;
    }

    console.log("Initializing notifications for user", userId);
    
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      initializeNotifications(userId);
    }, 100);
    
    // Set up polling for unread count every 30 seconds (backup, but real-time is preferred)
    const interval = setInterval(() => {
      console.log("Polling unread count...");
      fetchUnreadCount(userId);
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [userId, isAuthenticated, initializeNotifications, fetchUnreadCount]);

  // Listen for real-time notifications via SignalR
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    // Connect to SignalR if not already connected
    chatWebSocket.connect();

    // Subscribe to notification events
    const unsubscribe = chatWebSocket.onNotification((notification) => {
      console.log("🔔 Real-time notification received:", notification);
      
      // Check if notification is for current user
      if (notification.userId === userId || notification.UserId === userId) {
        // Normalize notification format (handle both PascalCase and camelCase)
        const normalizedNotification = {
          notificationId: notification.notificationId || notification.NotificationId,
          userId: notification.userId || notification.UserId,
          type: notification.type || notification.Type,
          title: notification.title || notification.Title,
          body: notification.body || notification.Body,
          isRead: notification.isRead !== undefined ? notification.isRead : (notification.IsRead !== undefined ? notification.IsRead : false),
          createdAt: notification.createdAt || notification.CreatedAt,
          userName: notification.userName || notification.UserName,
          userEmail: notification.userEmail || notification.UserEmail
        };
        
        // Ensure new notifications are always unread
        normalizedNotification.isRead = false;
        
        // Add notification to store (this will update unreadCount automatically)
        addNotification(normalizedNotification);
        
        // Refresh unread count from server after a short delay to ensure consistency
        setTimeout(() => {
          fetchUnreadCount(userId);
        }, 500);
        
        // Optional: Show browser notification
        if (Notification.permission === "granted") {
          new Notification(normalizedNotification.title, {
            body: normalizedNotification.body,
            icon: "/logo.png"
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, isAuthenticated, addNotification, fetchUnreadCount]);

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
    if (isOpen && userId) {
      fetchNotifications(userId);
      setShowAll(false); // Reset showAll when opening
    }
  }, [isOpen, fetchNotifications, userId]);

  // Không tự động đánh dấu đã đọc khi đóng menu
  // User phải click vào từng thông báo để đánh dấu đã đọc

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
      console.log('Formatting date:', dateString);
      
      // Parse date string - handle both UTC and local time
      let date;
      if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('UTC')) {
        // Already has timezone info
        date = new Date(dateString);
      } else {
        // Assume UTC if no timezone info (backend sends UTC)
        date = new Date(dateString + 'Z');
      }
      
      console.log('Parsed date:', date, 'isValid:', !isNaN(date.getTime()));
      
      const now = new Date();
      
      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
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

  // Xử lý click vào thông báo để đánh dấu đã đọc và hiển thị chi tiết
  const handleNotificationClick = async (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }
    // Hiển thị modal chi tiết thông báo
    setSelectedNotification(notification);
    setIsOpen(false); // Đóng menu dropdown
  };

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    if (unreadCount > 0 && userId) {
      await markAllAsRead(userId);
    }
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
          <div className="p-3 border-b border-slate-600 font-semibold flex items-center justify-between">
            <span>Thông báo {unreadCount > 0 && `(${unreadCount})`}</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
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
                      className={`px-4 py-3 hover:bg-slate-700 transition-colors cursor-pointer ${
                        !notification.isRead ? "bg-blue-900/20 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-white truncate">
                              {notification.title}
                              {!notification.isRead && (
                                <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                              )}
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

      {/* Modal chi tiết thông báo */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}

// Component modal hiển thị chi tiết thông báo
function NotificationDetailModal({ notification, onClose }) {
  if (!notification) return null;

  const formatFullDate = (dateString) => {
    try {
      let date;
      if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('UTC')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString + 'Z');
      }
      
      if (isNaN(date.getTime())) {
        return "Thời gian không xác định";
      }
      
      // Convert UTC to Vietnam timezone (UTC+7)
      const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      return vietnamDate.toLocaleString("vi-VN", {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Thời gian không xác định";
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-600 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Chi tiết thông báo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-gray-400">Tiêu đề</label>
            <p className="text-white mt-1 text-lg">{notification.title}</p>
          </div>

          {/* Body */}
          {notification.body && (
            <div>
              <label className="text-sm font-semibold text-gray-400">Nội dung</label>
              <p className="text-white mt-1 whitespace-pre-wrap">{notification.body}</p>
            </div>
          )}

          {/* Created At */}
          <div>
            <label className="text-sm font-semibold text-gray-400">Thời gian</label>
            <p className="text-white mt-1">{formatFullDate(notification.createdAt)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-600 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserNotificationMenu;
